"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { createSupabaseAdminClient } from "@/utils/supabaseAdmin";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";

export async function broadcastChatMessageNotification(messagePreview: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // Fetch the second most recent message to check the time gap
    const { data: recentMessages, error } = await supabaseAdmin
      .from("chat_messages")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(2);

    if (error) {
      console.error("Failed to fetch recent messages for cooldown check:", error);
      return { error: "Failed to verify cooldown" };
    }

    // We expect at least 1 message (the one the user just sent).
    // If there's a second message, we check its timestamp.
    if (recentMessages && recentMessages.length === 2) {
      const previousMessageTime = new Date(recentMessages[1].created_at).getTime();
      const currentMessageTime = new Date(recentMessages[0].created_at).getTime();
      
      const diffMinutes = (currentMessageTime - previousMessageTime) / (1000 * 60);

      // If the last message was less than 15 minutes ago, we DO NOT send a notification.
      if (diffMinutes < 15) {
        return { success: true, skipped: true, reason: "Cooldown active" };
      }
    }

    // Broadcast the notification if cooldown passed or it's the very first message
    await sendPushNotificationBroadcast({
      title: "New activity in Anonymous Chat",
      body: messagePreview.length > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview,
      url: "/main/student/chat"
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Chat notification error:", err);
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}

export async function sendChatMessage(sessionCode: string, messageText: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // 1. AI Toxicity Check
    const { generateAIResponse } = await import("@/utils/ai");
    const systemPrompt = `You are a chat moderator for a university campus platform. 
Determine if the following message is toxic, abusive, offensive, harassing, or contains severe profanity.
Respond with ONLY "TOXIC" if it should be blocked, or "OK" if it is safe to post.`;
    
    const moderationResult = await generateAIResponse(systemPrompt, messageText);
    
    if (moderationResult.trim().toUpperCase().includes("TOXIC")) {
      return { error: "Message blocked by AI Moderator due to inappropriate content." };
    }

    // 2. Insert into database
    const payload = {
      random_code: sessionCode,
      message: messageText,
    };

    const { data, error } = await supabase.from("chat_messages").insert([payload]).select().single();

    if (error) {
      console.error("Database insert error:", error);
      return { error: "Failed to send message to database." };
    }

    // 3. Broadcast notification
    await broadcastChatMessageNotification(messageText);

    return { success: true, data };
  } catch (err: unknown) {
    console.error("sendChatMessage error:", err);
    return { error: err instanceof Error ? err.message : "Failed to process message." };
  }
}
