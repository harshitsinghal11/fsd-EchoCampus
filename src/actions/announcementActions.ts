"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";

export async function addAnnouncement(formData: {
  title: string;
  content: string;
  link: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    // Insert Announcement
    const { error: postError } = await supabase.from("announcements").insert({
      title: formData.title,
      content: formData.content,
      link: formData.link || null, // If empty string, save as NULL
      author_id: user.id,
    });

    if (postError) {
      return { error: postError.message || "Failed to post announcement" };
    }

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
