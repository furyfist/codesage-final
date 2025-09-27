import { NextResponse } from 'next/server';
import { executeCode } from '@/services/codeExecution.service';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { code, language, interview_id, user_id } = await request.json();

    if (!code || !language || !interview_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Executing code for interview ${interview_id}...`);
    const executionResult = await executeCode(code, language);
    console.log('Execution result:', executionResult);

    // Save the code execution attempt to our database
    // This is crucial for generating the final report
    const { error: dbError } = await supabase.from('responses').insert({
      interview_id,
      user_id,
      // We are storing code output in the 'response_text' field for now
      response_text: JSON.stringify({
        code,
        language,
        ...executionResult,
      }),
      // We'll mark these as 'code' type to distinguish from voice responses
      response_type: 'code_execution',
    });

    if (dbError) {
      console.error('Error saving code execution to Supabase:', dbError);
      // We'll still return the result to the user even if DB save fails
    }

    return NextResponse.json(executionResult);

  } catch (error: any) {
    console.error('Error in /api/coding/execute:', error);
    return NextResponse.json({ error: error.message || 'Failed to execute code' }, { status: 500 });
  }
}
