import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabaseConfig";

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn(
      "⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. " +
      "Falling back to anonymous/public client. Admin privileges (like bypassing RLS) will not work."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
