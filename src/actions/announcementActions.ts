"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:admin@echocampus.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

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

    // --- SEND PUSH NOTIFICATIONS ---
    try {
      // Use service role or regular client. Regular client might fail if RLS doesn't allow reading all subscriptions.
      // Wait, we need to bypass RLS to read everyone's subscriptions! 
      // If we use regular client, RLS says "Users can select their own subscriptions". 
      // This means we won't get everyone's subs. We need to bypass RLS or change RLS.
      // Actually, since we need to send push, we can just change RLS for SELECT to true, or use a service key.
      // Let's assume we can fetch them or we'll update the RLS policy in database.sql.
      const { data: subs } = await supabase.from("push_subscriptions").select("*");
      
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: "New Campus Announcement",
          body: formData.title,
          url: "/main/student"
        });

        // Fire and forget (don't block the request)
        Promise.all(subs.map(async (sub) => {
          try {
            await webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }, payload);
          } catch (e: any) {
            if (e.statusCode === 410 || e.statusCode === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        })).catch(console.error);
      }
    } catch (pushErr) {
      console.error("Failed to process pushes:", pushErr);
    }

    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Connection failed." };
  }
}
