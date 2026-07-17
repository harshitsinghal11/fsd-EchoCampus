"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { generateAIResponse } from "@/utils/ai";
import { z } from "zod";
import { after } from "next/server";
import { revalidatePath } from "next/cache";

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

    // 1. Insert immediately to unblock the UI
    const { data: insertedComplaint, error: insertError } = await supabase
      .from("complaint_box")
      .insert({
        user_id: user.id,
        content: parsed.data.complaint,
        is_anonymous: parsed.data.isAnonymous,
        urgency: 'PENDING',
        category: 'Processing...'
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === 'P0001' || insertError.message?.includes("Weekly limit reached!")) {
        return { error: "Weekly limit reached! You can only submit 1 complaint per week." };
      }
      return { error: insertError.message || "Failed to submit complaint" };
    }

    // Invalidate immediately so the user sees the 'Processing...' state
    revalidatePath('/main/student/complaints');
    revalidatePath('/main/faculty/complaints');

    // 2. Offload AI processing to background (Next.js 15 after API)
    if (insertedComplaint?.id) {
      after(async () => {
        console.log(`[Background] Starting AI processing for complaint ID: ${insertedComplaint.id}`);
        let urgency = 'LOW';
        let category = 'General';
        
        // Use a background service client that doesn't rely on cookies
        const backgroundSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        try {
          const aiPrompt = "Analyze this campus complaint. Return ONLY a valid JSON object with exactly two keys: 'urgency' (must be HIGH, MEDIUM, or LOW) and 'category' (e.g., Infrastructure, Academics, Hostel, Admin, Harassment). Return ONLY JSON, no markdown formatting.";
          const aiResult = await generateAIResponse(aiPrompt, parsed.data.complaint);
          
          const cleanedResult = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedAi = JSON.parse(cleanedResult);
          
          if (parsedAi.urgency) urgency = parsedAi.urgency;
          if (parsedAi.category) category = parsedAi.category;
          
          const { error: updateError } = await backgroundSupabase
            .from("complaint_box")
            .update({ urgency, category })
            .eq('id', insertedComplaint.id);
            
          if (updateError) {
            console.error("Supabase Update Error (Success Path):", updateError);
          }
            
          if (urgency === 'HIGH') {
            sendPushNotificationBroadcast({
              title: "🔥 HIGH URGENCY: Campus Complaint",
              body: parsed.data.complaint.length > 50 ? parsed.data.complaint.substring(0, 50) + "..." : parsed.data.complaint,
              url: "/main/faculty/complaints"
            }).catch(console.error);
          }
          
          // Re-invalidate to show the final AI results
          revalidatePath('/main/student/complaints');
          revalidatePath('/main/faculty/complaints');
        } catch (aiErr) {
          console.error("Failed to analyze complaint with AI in background:", aiErr);
          const { error: fallbackError } = await backgroundSupabase
            .from("complaint_box")
            .update({ urgency: 'LOW', category: 'Uncategorized' })
            .eq('id', insertedComplaint.id);
            
          if (fallbackError) {
            console.error("Supabase Fallback Update Error:", fallbackError);
          }
            
          revalidatePath('/main/student/complaints');
          revalidatePath('/main/faculty/complaints');
        }
      });
    }

    return { success: true };

  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
