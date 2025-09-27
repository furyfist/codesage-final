import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import OpenAI from 'openai';
import { PROGRESSIVE_HINT_PROMPTS } from '@/lib/prompts/coding-interviewer';

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
    const { code, problem, interview_id, user_id } = await request.json();

    if (!code || !problem || !interview_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check how many hints have been given for this interview
    const { data: hints, error: countError } = await supabase
      .from('responses')
      .select('id')
      .eq('interview_id', interview_id)
      .eq('user_id', user_id)
      .eq('response_type', 'code_hint');

    if (countError) throw countError;

    const hintCount = hints?.length || 0;
    let hintLevel: 'nudge' | 'guide' | 'direction';

    if (hintCount === 0) {
      hintLevel = 'nudge';
    } else if (hintCount === 1) {
      hintLevel = 'guide';
    } else {
      hintLevel = 'direction';
    }

    // 2. Select the appropriate prompt
    const hintInstruction = PROGRESSIVE_HINT_PROMPTS[hintLevel];
    
    const systemPrompt = `You are an expert programming interview assistant. Your goal is to help a candidate solve a problem without giving away the answer.`;
    const userPrompt = `The programming problem is: "${problem}". The candidate's current code is: \n\n\`\`\`\n${code}\n\`\`\`\n\nThey are stuck. ${hintInstruction}`;

    // 3. Call OpenAI to get the hint
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const hint = response.choices[0].message.content;

    // 4. Save the hint to the database to track it
    const { error: dbError } = await supabase.from('responses').insert({
      interview_id,
      user_id,
      response_text: JSON.stringify({ hint, hintLevel }),
      response_type: 'code_hint',
    });

    if (dbError) {
      console.error('Error saving hint to Supabase:', dbError);
    }

    return NextResponse.json({ hint });

  } catch (error: any) {
    console.error('Error in /api/coding/get-hint:', error);
    return NextResponse.json({ error: error.message || 'Failed to get hint' }, { status: 500 });
  }
}
