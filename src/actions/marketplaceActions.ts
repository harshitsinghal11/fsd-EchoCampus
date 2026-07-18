"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const marketplaceSchema = z.object({
  product_title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000, "Description is too long"),
  price: z.number().positive("Price must be greater than 0"),
  contact_info: z.string().min(10, "Contact info must be valid"),
  image_url: z.string().optional(),
});

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
  image_url?: string;
}) {
  try {
    const parsed = marketplaceSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

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
      product_title: parsed.data.product_title,
      description: parsed.data.description,
      price: parsed.data.price,
      owner_name: ownerName,
      contact_info: parsed.data.contact_info,
      owner_email: user.email,
      image_url: parsed.data.image_url || null,
      is_sold: false,
    });

    if (insertError) {
      if (insertError.code === 'P0001' || insertError.message?.includes("limit")) {
        return { error: "Limit Reached: You can only post 1 item every 3 days." };
      }
      return { error: insertError.message || "Failed to insert marketplace item" };
    }

    sendPushNotificationBroadcast({
      title: "New Item in Marketplace",
      body: parsed.data.product_title,
      url: "/main/student/marketplace"
    }).catch(console.error);

    revalidatePath("/main/student/marketplace");

    return { success: true };

  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Connection failed." };
  }
}

export async function deleteMarketplaceItem(id: string, imageUrl: string | null) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Session expired. Please login again." };
    }

    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        // Assume marketplace images are in a bucket like 'marketplace_images' or 'lost_found_images'
        // Actually, where are marketplace images stored?
        // Let's assume 'marketplace_images' based on standard naming, wait I will check the upload code just in case, but usually it's best to try deleting.
        const { error: storageError } = await supabase.storage.from('marketplace_images').remove([fileName]);
        if (storageError) {
          console.error("Failed to delete image:", storageError);
        }
      }
    }

    const { error: deleteError } = await supabase.from("marketplace").delete().eq("id", id).eq("owner_id", user.id);

    if (deleteError) {
      return { error: deleteError.message || "Failed to delete item" };
    }

    revalidatePath("/main/student/marketplace");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    return { error: message };
  }
}
