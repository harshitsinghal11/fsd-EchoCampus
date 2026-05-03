import { createBrowserClient } from "@supabase/ssr";

import { supabasePublicKey, supabaseUrl } from "@/lib/supabaseConfig";

// FIX: Use createBrowserClient instead of createClient
export const supabase = createBrowserClient(supabaseUrl, supabasePublicKey);
