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
  } catch (error: unknown) {
    console.error("Enhance Error:", error);
    return { error: (error instanceof Error ? error.message : String(error)) || "Failed to enhance announcement." };
  }
}

export async function enhanceComplaint(text: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    if (!text || text.trim().length === 0) {
      return { error: "Please provide some text to enhance." };
    }

    const systemPrompt = "You are a professional campus counselor. Rewrite the following student complaint to be constructive, clear, and professional, removing offensive language but keeping the core issue intact. Do not output anything else but the rewritten text.";

    const enhancedText = await generateAIResponse(systemPrompt, text);
    return { success: true, enhancedText: enhancedText.trim() };
  } catch (error: unknown) {
    console.error("Enhance Complaint Error:", error);
    return { error: (error instanceof Error ? error.message : String(error)) || "Failed to enhance complaint." };
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
  } catch (error: unknown) {
    console.error("Analyze Lost Item Error:", error);
    return { error: (error instanceof Error ? error.message : String(error)) || "Failed to analyze image." };
  }
}

export async function getComplaintInsights() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // Fetch the latest 10 complaints to analyze trends
    const { data: complaints, error: fetchError } = await supabase
      .from("complaint_box")
      .select("content, urgency, category, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      return { error: "Failed to fetch complaints for analysis." };
    }

    if (!complaints || complaints.length === 0) {
      return { success: true, summary: "No recent complaints found to analyze." };
    }

    // Prepare data for the prompt
    const complaintsText = complaints.map(c =>
      `[${c.urgency}] [${c.category}] ${c.content}`
    ).join("\n");

    const systemPrompt = "You are a data analyst for a university administration. Review the following list of the top 50 recent student complaints. Provide a highly scannable, bulleted summary of trends or urgent matters in 3-4 short points. Keep it very simple and easy to read at a glance on a dashboard. Use standard Markdown for bullet points and bolding key terms. Do not use filler words like 'Here is the summary'.";

    const summary = await generateAIResponse(systemPrompt, complaintsText);

    return { success: true, summary: summary.trim() };
  } catch (error: unknown) {
    console.error("Insights Error:", error);
    return { error: (error instanceof Error ? error.message : String(error)) || "Failed to generate insights." };
  }
}
