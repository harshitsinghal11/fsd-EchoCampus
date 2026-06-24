import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabaseConfig";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) { 
            try { 
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); 
            } catch { 
                // Ignored in server components/GET requests
            } 
        },
      },
    }
  );
}
