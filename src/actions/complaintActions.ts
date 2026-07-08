"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { generateAIResponse } from "@/utils/ai";
import { z } from "zod";

const complaintSchema = z.object({
  complaint: z.string().min(5, "Complaint must be at least 5 characters long").max(1000, "Complaint is too long"),
  isAnonymous: z.boolean(),
});

export async function submitComplaint(formData: {
  complaint: string;
  isAnonymous: boolean;
}) {
  try {
    const parsed = complaintSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    let urgency = 'LOW';
    let category = 'General';

    try {
      const aiPrompt = "Analyze this campus complaint. Return ONLY a valid JSON object with exactly two keys: 'urgency' (must be HIGH, MEDIUM, or LOW) and 'category' (e.g., Infrastructure, Academics, Hostel, Admin, Harassment). Return ONLY JSON, no markdown formatting.";
      const aiResult = await generateAIResponse(aiPrompt, parsed.data.complaint);
      
      const cleanedResult = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedAi = JSON.parse(cleanedResult);
      
      if (parsedAi.urgency) urgency = parsedAi.urgency;
      if (parsedAi.category) category = parsedAi.category;
    } catch (aiErr) {
      console.error("Failed to analyze complaint with AI:", aiErr);
    }

    const { error: insertError } = await supabase
      .from("complaint_box")
      .insert({
        user_id: user.id,
        content: parsed.data.complaint,
        is_anonymous: parsed.data.isAnonymous,
        urgency,
        category
      });

    if (insertError) {
      if (insertError.code === 'P0001' || insertError.message?.includes("Weekly limit reached!")) {
        return { error: "Weekly limit reached! You can only submit 1 complaint per week." };
      }
      return { error: insertError.message || "Failed to submit complaint" };
    }

    if (urgency === 'HIGH') {
      sendPushNotificationBroadcast({
        title: "🔥 HIGH URGENCY: Campus Complaint",
        body: parsed.data.complaint.length > 50 ? parsed.data.complaint.substring(0, 50) + "..." : parsed.data.complaint,
        url: "/main/faculty/complaints"
      }).catch(console.error);
    }

    return { success: true };

  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
