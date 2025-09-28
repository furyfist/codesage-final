import { NextResponse } from 'next/server';
import { executeCode } from '@/services/codeExecution.service';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import OpenAI from 'openai';
import { CODE_EXECUTION_FOLLOW_UP_PROMPT } from '@/lib/prompts/coding-interviewer';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { code, language, interview_id, user_id } = await request.json();

    if (!code || !language || !interview_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[Agentic Loop] Step 1: Executing code for interview ${interview_id}...`);
    const executionResult = await executeCode(code, language);
    console.log('[Agentic Loop] Step 1 complete. Result:', executionResult);

    // Save the code execution attempt to our database
    const { error: dbError } = await supabase.from('responses').insert({
      interview_id,
      user_id,
      response_text: JSON.stringify({ code, language, ...executionResult }),
      response_type: 'code_execution',
    });
    if (dbError) console.error('Error saving code execution to Supabase:', dbError);

    console.log('[Agentic Loop] Step 2: Generating AI follow-up...');
    // --- THIS IS THE AGENTIC LOOP ---
    // We take the result and feed it back to the AI to get the next spoken line.
    let followUpPrompt = CODE_EXECUTION_FOLLOW_UP_PROMPT;
    followUpPrompt = followUpPrompt.replace('{CODE}', code);
    followUpPrompt = followUpPrompt.replace('{STATUS}', executionResult.status);
    followUpPrompt = followUpPrompt.replace('{OUTPUT}', executionResult.output || 'None');
    followUpPrompt = followUpPrompt.replace('{ERROR}', executionResult.error || 'None');
    
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: followUpPrompt }],
        temperature: 0.6,
    });
    
    const aiFollowUp = response.choices[0].message.content;
    console.log('[Agentic Loop] Step 2 complete. AI Follow-up:', aiFollowUp);

    // We will later feed this aiFollowUp back into the Retell agent.
    // For now, we'll send it to the frontend to display.

    return NextResponse.json({
        executionResult,
        aiFollowUp,
    });

  } catch (error: any) {
    console.error('Error in /api/coding/execute:', error);
    return NextResponse.json({ error: error.message || 'Failed to execute code' }, { status: 500 });
  }
}

