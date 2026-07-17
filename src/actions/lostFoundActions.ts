"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { sendPushNotificationBroadcast } from "@/utils/pushUtility";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const lostFoundSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(30, "Title is too long"),
  description: z.string().min(5, "Description must be at least 5 characters").max(50, "Description is too long"),
  location_found: z.string().min(3, "Location must be at least 3 characters").max(200, "Location is too long"),
  contact_info: z.string().min(10, "Contact info must be valid"),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export async function addLostFoundItem(formData: {
  title: string;
  description: string;
  location_found: string;
  contact_info: string;
  image_url: string;
}) {
  try {
    const parsed = lostFoundSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Session expired. Please login again." };
    }

    const { error: insertError } = await supabase.from("lost_found").insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      location_found: parsed.data.location_found,
      contact_info: parsed.data.contact_info,
      image_url: parsed.data.image_url || null,
      is_resolved: false
    });

    if (insertError) {
      if (insertError.code === 'P0001' || insertError.message?.includes("Daily limit reached") || insertError.message?.includes("limit")) {
        return { error: "Limit Reached: You can only post 2 items every 24 hours. Please try again tomorrow." };
      }
      return { error: insertError.message || "Failed to report lost item" };
    }

    sendPushNotificationBroadcast({
      title: "New Lost & Found Report",
      body: parsed.data.title,
      url: "/main/student/lost-found"
    }).catch(console.error);

    revalidatePath("/main/student/lost-found");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    if (message.includes("Daily limit reached") || message.includes("limit")) {
      return { error: "Limit Reached: You can only post 2 items every 24 hours. Please try again tomorrow." };
    }
    return { error: message };
  }
}

export async function deleteLostFoundItem(id: string, imageUrl: string | null) {
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
        const { error: storageError } = await supabase.storage.from('lost_found_images').remove([fileName]);
        if (storageError) {
          console.error("Failed to delete image:", storageError);
        }
      }
    }

    const { error: deleteError } = await supabase.from("lost_found").delete().eq("id", id).eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError.message || "Failed to delete item" };
    }

    revalidatePath("/main/student/lost-found");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    return { error: message };
  }
}

export async function resolveLostFoundItem(id: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Session expired. Please login again." };
    }

    const { error: updateError } = await supabase
      .from("lost_found")
      .update({ is_resolved: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: updateError.message || "Failed to resolve item" };
    }

    revalidatePath("/main/student/lost-found");

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    return { error: message };
  }
}
