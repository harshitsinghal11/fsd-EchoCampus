"use server";

import { createSupabaseServerClient } from "@/utils/supabaseServer";

export async function addLostFoundItem(formData: {
  title: string;
  description: string;
  location_found: string;
  contact_info: string;
  image_url: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Session expired. Please login again." };
    }

    const { error: insertError } = await supabase.from("lost_found").insert({
      user_id: user.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      location_found: formData.location_found.trim(),
      contact_info: formData.contact_info,
      image_url: formData.image_url,
      is_resolved: false
    });

    if (insertError) {
      if (insertError.message?.includes("Daily limit reached") || insertError.message?.includes("limit")) {
        return { error: "Limit Reached: You can only post 2 items every 24 hours. Please try again tomorrow." };
      }
      return { error: insertError.message || "Failed to report lost item" };
    }

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

    return { success: true };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed.";
    return { error: message };
  }
}
