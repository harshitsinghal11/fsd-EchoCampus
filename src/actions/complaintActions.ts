"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";

export async function submitComplaint(formData: {
  complaint: string;
  isAnonymous: boolean;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    if (!formData.complaint || typeof formData.complaint !== "string") {
      return { error: "Invalid complaint content" };
    }

    const { error: insertError } = await supabase
      .from("complaint_box")
      .insert({
        user_id: user.id,
        content: formData.complaint,
        is_anonymous: !!formData.isAnonymous
      });

    if (insertError) {
      if (insertError.message?.includes("Weekly limit reached!")) {
        return { error: "Weekly limit reached! You can only submit 1 complaint per week." };
      }
      return { error: insertError.message || "Failed to submit complaint" };
    }

    await sendPushNotificationBroadcast({
      title: "New Campus Complaint",
      body: formData.complaint.length > 50 ? formData.complaint.substring(0, 50) + "..." : formData.complaint,
      url: "/main/faculty/complaints"
    });

    return { success: true };

  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
