import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CODING_INTERVIEWER_PROMPT } from '@/lib/prompts/coding-interviewer';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, difficulty } = await request.json();

    if (!topic || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields: topic and difficulty' }, { status: 400 });
    }

    const systemPrompt = CODING_INTERVIEWER_PROMPT;
    const userPrompt = `Generate a new, unique coding interview problem based on the topic of "${topic}" with a difficulty level of "${difficulty}". The problem statement should be clear, concise, and include at least one example of an input and its expected output. Do not include the solution.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const problem = response.choices[0].message.content;
    
    return NextResponse.json({ problem });

  } catch (error: any) {
    console.error('Error in /api/coding/generate-problem:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate problem' }, { status: 500 });
  }
}
