import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Server missing API Key" }, { status: 500 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
        ...messages
      ],
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message;

    return NextResponse.json({ message: responseMessage });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
