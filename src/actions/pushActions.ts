"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";

type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function savePushSubscription(subscription: PushSubscriptionPayload) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh;
    const auth = subscription.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { error: "Invalid subscription payload" };
    }

    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth
      }, { onConflict: 'user_id, endpoint' });

    if (insertError) {
      console.error("Save subscription error:", insertError);
      return { error: "Failed to save subscription" };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Push subscription catch error:", error);
    return { error: "Server error saving subscription" };
  }
}
