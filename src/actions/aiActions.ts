"use server";

import { generateAIResponse } from "@/utils/ai";
import { createSupabaseServerClient } from "@/utils/supabaseServer";

export async function enhanceAnnouncement(text: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    if (!text || text.trim().length === 0) {
      return { error: "Please provide some text to enhance." };
    }

    const systemPrompt = "You are a professional university secretary. Rewrite the following brief note into a formal, polite campus announcement suitable for students. Do not add made up facts, just rewrite the tone. Do not output anything else but the rewritten text.";
    
    const enhancedText = await generateAIResponse(systemPrompt, text);
    return { success: true, enhancedText: enhancedText.trim() };
  } catch (error: any) {
    console.error("Enhance Error:", error);
    return { error: error.message || "Failed to enhance announcement." };
  }
}

export async function analyzeLostItem(imageUrl: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    if (!imageUrl) {
      return { error: "No image URL provided." };
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { error: "Failed to fetch image." };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    const systemPrompt = "Identify the main object in this image. Return ONLY a valid JSON object with exactly two keys: 'title' (a short, clear name like 'Blue Milton Water Bottle', STRICTLY under 30 characters) and 'description' (a visual description focusing on brand, color, and defining marks, STRICTLY under 50 characters). Return ONLY JSON, no markdown formatting.";
    
    const { generateAIVisionResponse } = await import("@/utils/ai");
    const aiResult = await generateAIVisionResponse(systemPrompt, base64Image, mimeType);
    
    const cleanedResult = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedAi = JSON.parse(cleanedResult);
    
    return { 
      success: true, 
      title: parsedAi.title || "",
      description: parsedAi.description || ""
    };
  } catch (error: any) {
    console.error("Analyze Lost Item Error:", error);
    return { error: error.message || "Failed to analyze image." };
  }
}
