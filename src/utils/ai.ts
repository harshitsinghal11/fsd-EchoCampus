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

  // Using gemini-flash-latest (exact string that avoids 404)
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: systemPrompt,
  });

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(userText);
      return result.response.text();
    } catch (error: unknown) {
      lastError = error;
      if ((error as {status?: number})?.status === 503) {
        console.warn(`503 Server Busy on Text Generation, retrying in 1s... (${i + 1}/3)`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      break; // Not a 503, break and throw
    }
  }
  
  console.error("AI Generation Error:", lastError);
  throw new Error(`Failed to generate AI response: ${(lastError as Error)?.message || "Unknown error"}`);
}
export async function generateAIVisionResponse(systemPrompt: string, base64Image: string, mimeType: string): Promise<string> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType
      }
    }
  ];

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent([systemPrompt, ...imageParts]);
      return result.response.text();
    } catch (error: unknown) {
      lastError = error;
      if ((error as {status?: number})?.status === 503 || (error as {message?: string})?.message?.includes("503")) {
        console.warn(`503 Server Busy on Vision Generation, retrying in 1s... (${i + 1}/3)`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      break; // Break if it's a 404 or other error
    }
  }

  console.error("AI Vision Generation Error:", lastError);
  throw new Error(`Failed to generate AI vision response: ${(lastError as Error)?.message || "Unknown error"}`);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error: unknown) {
      lastError = error;
      if ((error as {status?: number})?.status === 503 || (error as {message?: string})?.message?.includes("503")) {
        console.warn(`503 Server Busy on Embedding Generation, retrying in 1s... (${i + 1}/3)`);
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }
      break; 
    }
  }

  console.error("AI Embedding Generation Error:", lastError);
  throw new Error(`Failed to generate embedding: ${(lastError as Error)?.message || "Unknown error"}`);
}
