import { createSupabaseAdminClient } from "@/utils/supabaseAdmin";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:admin@echocampus.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function sendPushNotificationBroadcast(payloadObj: {
  title: string;
  body: string;
  url: string;
}) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: subs } = await supabaseAdmin.from("push_subscriptions").select("*");
    
    if (subs && subs.length > 0) {
      const payload = JSON.stringify(payloadObj);

      // Await the push notifications to ensure they finish in serverless environments
      await Promise.all(subs.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }, payload);
        } catch (e: unknown) {
          if ((e as {statusCode?: number}).statusCode === 410 || (e as {statusCode?: number}).statusCode === 404) {
            // Delete stale subscriptions
            await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }));
    }
  } catch (error) {
    console.error("Failed to broadcast push notification:", error);
  }
}
