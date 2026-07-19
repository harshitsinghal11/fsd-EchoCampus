"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content is too long"),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  eventStartDate: z.string().optional().nullable(),
  eventEndDate: z.string().optional().nullable(),
});

export async function addAnnouncement(formData: {
  title: string;
  content: string;
  link: string;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
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
      event_start_date: parsed.data.eventStartDate || null,
      event_end_date: parsed.data.eventEndDate || null,
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

    revalidatePath('/main/student');
    revalidatePath('/main/faculty/announcements');

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}

export async function toggleStarAnnouncement(announcementId: string, isStarred: boolean) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    if (isStarred) {
      const { error } = await supabase
        .from("starred_announcements")
        .insert({ user_id: user.id, announcement_id: announcementId });
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("starred_announcements")
        .delete()
        .match({ user_id: user.id, announcement_id: announcementId });
      if (error) return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to toggle star" };
  }
}

export async function deleteAnnouncement(announcementId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Verify ownership
    const { data: announcement, error: fetchError } = await supabase
      .from("announcements")
      .select("author_id")
      .eq("id", announcementId)
      .single();
      
    if (fetchError || !announcement) return { error: "Announcement not found" };
    if (announcement.author_id !== user.id) return { error: "Unauthorized to delete this announcement" };

    const { error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);

    if (deleteError) return { error: deleteError.message };

    revalidatePath('/main/student');
    revalidatePath('/main/faculty/announcements');

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete announcement" };
  }
}
