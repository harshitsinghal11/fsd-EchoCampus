"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content is too long"),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export async function addAnnouncement(formData: {
  title: string;
  content: string;
  link: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const parsed = announcementSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    // Insert Announcement
    const { error: postError } = await supabase.from("announcements").insert({
      title: parsed.data.title,
      content: parsed.data.content,
      link: parsed.data.link || null, // If empty string, save as NULL
      author_id: user.id,
    });

    if (postError) {
      return { error: postError.message || "Failed to post announcement" };
    }

    // --- SEND PUSH NOTIFICATIONS ---
    sendPushNotificationBroadcast({
      title: "New Campus Announcement",
      body: parsed.data.title,
      url: "/main/student"
    }).catch(console.error);

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
