import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "@/utils/ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    // 1. Generate embedding for user query
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(message);
    } catch (e) {
      console.error("Error generating embedding:", e);
      return new Response("Failed to process query", { status: 500 });
    }

    // 2. Search campus_knowledge via pgvector
    const supabase = await createSupabaseServerClient();
    const { data: documents, error } = await supabase.rpc("match_campus_knowledge", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // 0.5 is a reasonable default for cosine similarity
      match_count: 5,
    });

    if (error) {
      console.error("Vector search error:", error);
    }

    // 3. Construct System Prompt with Context
    const contextText = documents && documents.length > 0
      ? documents.map((doc: any) => doc.content).join("\n\n---\n\n")
      : "No specific campus information found in the database for this query.";

    const systemPrompt = `You are ECHO, the smart campus assistant for our university. 
You are helpful, concise, and friendly. Answer the student's question based ONLY on the following context. 
If the answer is not contained in the context, say "I don't have that information right now, please contact the administration."
Do not invent information.

CONTEXT:
${contextText}`;

    // 4. Call Gemini with streaming
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    });

    const resultStream = await model.generateContentStream(message);

    // 5. Pipe the async iterable into a Web ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
