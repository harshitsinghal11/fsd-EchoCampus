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
