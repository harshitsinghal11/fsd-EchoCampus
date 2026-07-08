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
  
  // Using gemini-1.5-flash for high speed as requested in phase 1.1
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  try {
    const result = await model.generateContent(userText);
    return result.response.text();
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate AI response.");
  }
}
