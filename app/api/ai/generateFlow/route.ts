import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Ensure you have GEMINI_API_KEY in .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Server missing API Key" }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `
You are a chatbot flow generator. The user will provide a system prompt that describes a chatbot's personality, behavior, and conversation goals.

Your task is to convert that system prompt into a structured conversation flow.

USER'S SYSTEM PROMPT:
${prompt}

Based on this prompt, create a conversation flow that:
1. Greets the user appropriately
2. Follows the personality and tone described
3. Collects any information mentioned in the prompt
4. Achieves the goals outlined in the prompt

Return ONLY a raw JSON array (no markdown, no code fences) with this schema:
[
  { "id": "1", "type": "BOT_MESSAGE", "text": "Welcome message...", "delayMs": 1000 },
  { "id": "2", "type": "INPUT_CAPTURE", "prompt": "What's your name?", "fieldKey": "name", "fieldType": "text", "required": true },
  { "id": "3", "type": "BOT_MESSAGE", "text": "Thanks {{name}}!", "delayMs": 800 },
  { "id": "4", "type": "QUICK_REPLIES", "text": "How can I help?", "options": ["Option 1", "Option 2"], "delayMs": 1000 }
]

Available types: BOT_MESSAGE, USER_MESSAGE, INPUT_CAPTURE, QUICK_REPLIES
Available fieldTypes: text, email, phone

Make it 6-10 steps, natural, and aligned with the system prompt's goals.
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('AI Response:', text);

    // Clean up if the model returned markdown
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let flow;
    try {
      flow = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Attempted to parse:', cleanText);
      return NextResponse.json({
        error: "AI returned invalid JSON. Please try again or simplify your prompt."
      }, { status: 500 });
    }

    if (!Array.isArray(flow)) {
      console.error('Flow is not an array:', flow);
      return NextResponse.json({
        error: "AI returned invalid flow structure. Please try again."
      }, { status: 500 });
    }

    return NextResponse.json({ flow });
  } catch (error: any) {
    console.error('AI Gen Error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json({
      error: error?.message || "Generation failed. Please check your API key and try again."
    }, { status: 500 });
  }
}