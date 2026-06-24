import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { complaintId } = (await req.json()) as { complaintId: string };
    if (!complaintId) {
      return NextResponse.json({ error: "Missing Complaint ID" }, { status: 400 });
    }
    const { data: existing, error: fetchError } = await supabase
      .from("complaint_upvotes")
      .select("id")
      .eq("complaint_id", complaintId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 4. TOGGLE LOGIC
    if (existing) {
      // --- A. REMOVE VOTE (Toggle Off) ---
      const { error: deleteError } = await supabase
        .from("complaint_upvotes")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json(
        {
          message: "Upvote removed",
          added: false,
          current_user_has_upvoted: false,
        },
        { status: 200 }
      );

    } else {
      // --- B. ADD VOTE (Toggle On) ---
      const { error: insertError } = await supabase
        .from("complaint_upvotes")
        .insert({
          complaint_id: complaintId,
          user_id: user.id
        });

      if (insertError) {
        // Handle Policy Violations (e.g., Faculty trying to vote)
        if (insertError.code === '42501') {
          return NextResponse.json({ error: "Students only" }, { status: 403 });
        }
        // Handle Race Condition (Double click)
        if (insertError.code === '23505') {
          return NextResponse.json(
            {
              message: "Already upvoted",
              added: true,
              current_user_has_upvoted: true,
            },
            { status: 200 }
          );
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json(
        {
          message: "Upvote added",
          added: true,
          current_user_has_upvoted: true,
        },
        { status: 201 }
      );
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
