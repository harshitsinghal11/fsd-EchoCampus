'use client';
import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { ComplaintSkeleton } from "@/components/shared/Skeletons";

type Complaint = {
  id: string;
  complaint: string;
  created_at: string;
  upvotes: number;
  current_user_has_upvoted?: boolean;
};

type UpvoteApiResponse = {
  added?: boolean;
  current_user_has_upvoted?: boolean;
  upvotes?: number;
};

interface ComplaintListProps {
  isWidget?: boolean;
}

export default function ComplaintList({ isWidget = false }: ComplaintListProps) {
  const [list, setList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState<string | null>(null);

  // 1. LOAD COMPLAINTS
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/complaints"); // Make sure this matches your file name
      const json = await res.json();
      let data = (json.complaints as Complaint[]) || [];

      if (isWidget) {
        data = data.slice(0, 3);
      }

      setList(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoading(false);
    }
  }, [isWidget]);

  // 2. NEW UPVOTE FUNCTION (Toggle Logic)
  async function upvote(id: string) {
    setUpvoting(id);

    try {
      const res = await fetch("/api/complaints/upvote", { // Ensure path matches your API folder structure
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: id }) // No email needed anymore!
      });

      if (!res.ok) {
        if (res.status === 401) toast.error("Please login to vote.");
        if (res.status === 403) toast.error("Only students can upvote.");
        return;
      }

      const data = (await res.json()) as UpvoteApiResponse;

      // 3. UPDATE UI IMMEDIATELY (Toggle Count)
      setList(currentList =>
        currentList.map(item => {
          if (item.id === id) {
            const hasUpvoted = Boolean(item.current_user_has_upvoted);
            const nextHasUpvoted =
              typeof data.current_user_has_upvoted === "boolean"
                ? data.current_user_has_upvoted
                : typeof data.added === "boolean"
                  ? data.added
                  : hasUpvoted;

            const nextUpvotes =
              typeof data.upvotes === "number"
                ? data.upvotes
                : nextHasUpvoted === hasUpvoted
                  ? item.upvotes
                  : Math.max(0, item.upvotes + (nextHasUpvoted ? 1 : -1));

            return {
              ...item,
              upvotes: nextUpvotes,
              current_user_has_upvoted: nextHasUpvoted,
            };
          }
          return item;
        })
      );

    } catch (error) {
      console.error("Failed to upvote:", error);
    } finally {
      setUpvoting(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('public:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaint_box' },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaint_upvotes' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading) {
    return <ComplaintSkeleton isWidget={isWidget} />;
  }

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto ${isWidget ? '' : 'bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6'}`}>

      {!isWidget && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-orange-400" />
            Live Complaints
          </h1>
          <p className="text-slate-300 mt-2">
            {list.length} {list.length === 1 ? 'complaint' : 'complaints'} from the community
          </p>
        </div>
      )}

      {list.length === 0 ? (
        <div className={`${isWidget ? 'h-full flex items-center justify-center' : 'bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center'}`}>
          {!isWidget && <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />}
          <p className="text-slate-400">No active complaints.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className={`bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:bg-slate-700/60 transition-all duration-200 ${isWidget ? 'p-4' : 'p-4'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className={`text-slate-300 font-medium leading-relaxed ${isWidget ? 'text-sm line-clamp-2' : 'text-lg'}`}>
                    &quot;{c.complaint}&quot;
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </div>

                {/* Vote Button */}
                <button
                  onClick={() => upvote(c.id)}
                  disabled={upvoting === c.id}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md border transition-colors disabled:opacity-50 group ${
                    c.current_user_has_upvoted
                      ? "bg-orange-500/20 border-orange-500/30"
                      : "bg-transparent border-slate-700/50 hover:bg-orange-500/10 hover:border-orange-500/30"
                  } ${isWidget ? '' : 'flex-col min-w-[60px]'}`}
                >
                  <span className={`text-sm font-bold ${c.current_user_has_upvoted ? 'text-white' : 'text-slate-300 group-hover:text-white'} ${upvoting === c.id ? 'animate-pulse' : ''}`}>
                    {c.upvotes}
                  </span>
                  <ThumbsUp className={`w-3.5 h-3.5 ${c.current_user_has_upvoted ? "text-orange-400" : "text-slate-400 group-hover:text-orange-400"} ${upvoting === c.id ? 'text-orange-400' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
