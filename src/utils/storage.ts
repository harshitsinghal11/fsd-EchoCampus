import { supabase } from "@/lib/supabaseClient";

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 * 
 * @param file The file to upload
 * @param bucketName The name of the Supabase storage bucket
 * @param prefix An optional prefix for the file name (usually userId)
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  bucketName: string,
  prefix: string = "user"
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
}
