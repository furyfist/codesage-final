import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import OpenAI from 'openai';
import { CODING_GRADING_FEEDBACK_PROMPT } from '@/lib/prompts/coding-interviewer';

// Initialize Supabase and OpenAI clients
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { interview_id } = await request.json();
    if (!interview_id) {
      return NextResponse.json({ error: 'Missing interview_id' }, { status: 400 });
    }

    console.log(`[Report] Generating full report for interview ${interview_id}...`);
    // 1. Fetch all responses for this interview from the database
    const { data: responses, error } = await supabase
      .from('responses')
      .select('*')
      .eq('interview_id', interview_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: 'No responses found for this interview' }, { status: 404 });
    }

    // 2. Construct a comprehensive transcript of the entire session
    let fullTranscript = "Interview Transcript:\n\n";
    for (const res of responses) {
      if (res.response_type === 'voice') {
        fullTranscript += `[VOICE] ${res.response_text}\n`;
      } else if (res.response_type === 'code_execution') {
        const data = JSON.parse(res.response_text || '{}');
        fullTranscript += `[CODE SUBMISSION]\nStatus: ${data.status}\n---\n${data.code}\n---\nResult: ${data.output || data.error}\n\n`;
      }
    }

    // 3. Build the Master Prompt
    const systemPrompt = CODING_GRADING_FEEDBACK_PROMPT + `\n You must respond with only a valid JSON object. Do not include markdown or any other text.`;
    const userPrompt = `Here is the full transcript of a coding interview session. Analyze it in its entirety. Provide a detailed, structured analysis of the candidate's performance across multiple dimensions.
    
    ${fullTranscript}

    Now, provide your final grading and feedback as a JSON object.
    `;

    // 4. Call the AI to generate the structured JSON report
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Ask for a JSON response!
    });
    
    const reportJson = JSON.parse(response.choices[0].message.content || '{}');
    console.log(`[Report] Report generated successfully.`);

    return NextResponse.json(reportJson);

  } catch (error: any) {
    console.error('Error in /api/coding/generate-full-report:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
