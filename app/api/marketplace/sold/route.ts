import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabaseConfig";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          void cookiesToSet;
        } 
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body; // The ID of the marketplace item

  // RLS Policy already handles this, but adding owner_id check here is extra safe
  const { data, error } = await supabase
    .from("marketplace")
    .update({ is_sold: true })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select(); 

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Item not found or you don't have permission to modify it." }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
