import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabaseServer";

// GET: Fetch Complaints
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : null;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // 2. Build Query
  // We fetch global count, AND specific upvotes by this user to check "has_upvoted"
  let query = supabase
    .from("complaint_box")
    .select(`
      id, 
      content, 
      created_at,
      is_anonymous,
      user_id,
      complaint_upvotes(count)
    `)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  // If a user is logged in, we verify if they upvoted each complaint
  // We do this by a separate query or by fetching their specific vote id in the main query.
  // Limitation: Supabase complex filters in deep selects can be tricky.
  // Efficient workaround: Fetch user's upvotes ID list in parallel if logged in.

  const myUpvotedIds = new Set<string>();
  if (currentUserId) {
    const { data: myVotes } = await supabase
      .from("complaint_upvotes")
      .select("complaint_id")
      .eq("user_id", currentUserId);

    if (myVotes) {
      myVotes.forEach(v => myUpvotedIds.add(v.complaint_id));
    }
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const complaintsData = (data ?? []) as ComplaintRow[];
  const visibleAuthorIds = Array.from(
    new Set(
      complaintsData
        .filter((complaint) => !complaint.is_anonymous)
        .map((complaint) => complaint.user_id)
    )
  );

  const sessionCodeByUserId = new Map<string, string>();
  if (visibleAuthorIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("student_profiles")
      .select("user_id, session_code")
      .in("user_id", visibleAuthorIds);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    for (const profile of (profileRows ?? []) as StudentProfileRow[]) {
      if (profile.user_id) {
        sessionCodeByUserId.set(profile.user_id, profile.session_code || "Unknown");
      }
    }
  }

  // 3. Transform data safely
  const complaints = complaintsData.map((c) => {
    // SAFEGUARDS:
    // 1. If anonymous, do not send session_code (optional) or user_id back to client.
    // 2. Count extraction
    const upvoteCount = c.complaint_upvotes?.[0]?.count || 0;

    return {
      id: c.id,
      complaint: c.content,
      created_at: c.created_at,
      // Logic: If anonymous, mask the Session Code AND the User ID
      session_code: c.is_anonymous
        ? "Anonymous"
        : sessionCodeByUserId.get(c.user_id) || "Unknown",
      // NEVER return the author's user_id if it is anonymous
      author_id: c.is_anonymous ? null : c.user_id,
      upvotes: upvoteCount,
      current_user_has_upvoted: myUpvotedIds.has(c.id),
    };
  });

  return NextResponse.json({ complaints });
}

// Updated Types to reflect Supabase returns
type ComplaintRow = {
  id: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  user_id: string;
  complaint_upvotes?: { count: number }[] | null;
};

type StudentProfileRow = {
  user_id: string;
  session_code: string | null;
};
