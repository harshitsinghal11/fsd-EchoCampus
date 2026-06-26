"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";

interface StudentProfileData {
  session_code: string | null;
}

interface UserData {
  full_name: string | null;
  role: string | null;
  student_profiles: StudentProfileData | StudentProfileData[] | null;
}

export async function addMarketplaceItem(formData: {
  product_title: string;
  description: string;
  price: number;
  contact_info: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const { data: rawUserData, error: userError } = await supabase
      .from("users")
      .select(`
        full_name,
        role,
        student_profiles ( session_code )
      `)
      .eq("id", user.id)
      .single();

    if (userError) {
      return { error: "Failed to fetch user profile" };
    }

    const userData = rawUserData as UserData | null;
    let ownerName = "Unknown Seller";

    if (userData?.role === 'student' && userData.student_profiles) {
      const profile = Array.isArray(userData.student_profiles)
        ? userData.student_profiles[0]
        : userData.student_profiles;
      ownerName = profile?.session_code || "Anonymous Student";
    } else if (userData?.full_name) {
      ownerName = userData.full_name;
    }

    const { error: insertError } = await supabase.from("marketplace").insert({
      owner_id: user.id,
      product_title: formData.product_title.trim(),
      description: formData.description.trim(),
      price: formData.price,
      owner_name: ownerName,
      contact_info: formData.contact_info,
      owner_email: user.email,
      is_sold: false,
    });

    if (insertError) {
      return { error: insertError.message || "Failed to insert marketplace item" };
    }

    await sendPushNotificationBroadcast({
      title: "New Item in Marketplace",
      body: formData.product_title,
      url: "/main/student/marketplace"
    });

    return { success: true };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Connection failed." };
  }
}
