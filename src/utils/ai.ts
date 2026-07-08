import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateAIResponse(systemPrompt: string, userText: string): Promise<string> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  // Using gemini-flash-latest as older models are deprecated
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: systemPrompt,
  });

  try {
    const result = await model.generateContent(userText);
    return result.response.text();
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(`Failed to generate AI response: ${error?.message || "Unknown error"}`);
  }
}
