'use client';
import { useState } from "react";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { ComplaintSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useComplaints } from "@/hooks/data/useComplaints";
import { EmptyComplaints } from "@/components/shared/EmptyStates";

type UpvoteApiResponse = {
  added?: boolean;
  current_user_has_upvoted?: boolean;
  upvotes?: number;
};

interface ComplaintListProps {
  isWidget?: boolean;
}

export default function ComplaintList({ isWidget = false }: ComplaintListProps) {
  const [limit, setLimit] = useState(10);
  const { items, isLoading, mutate } = useComplaints(isWidget, isWidget ? undefined : limit);
  const [upvoting, setUpvoting] = useState<string | null>(null);

  async function upvote(id: string) {
    setUpvoting(id);

    try {
      const res = await fetch("/api/complaints/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: id })
      });

      if (!res.ok) {
        if (res.status === 401) toast.error("Please login to vote.");
        if (res.status === 403) toast.error("Only students can upvote.");
        return;
      }

      await res.json();
      mutate();

    } catch (error) {
      toast.error("Failed to upvote");
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

  if (isLoading) {
    return (
      <div className={`flex-1 flex flex-col w-full h-full overflow-y-auto ${isWidget ? '' : 'bg-surface backdrop-blur-xl border border-border rounded-xl p-6'}`}>
        {!isWidget && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              Live Complaints
            </h1>
            <div className="h-5 bg-surface-hover rounded-md w-48 mt-2 animate-pulse"></div>
          </div>
        )}
        <ComplaintSkeleton isWidget={isWidget} />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col w-full h-full overflow-y-auto ${isWidget ? '' : 'bg-surface backdrop-blur-xl border border-border rounded-xl p-6'}`}>

      {!isWidget && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            Live Complaints
          </h1>
          <p className="text-text-secondary mt-2">
            {items.length} {items.length === 1 ? 'complaint' : 'complaints'} from the community
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyComplaints isWidget={isWidget} />
      ) : (
        <MotionList className="space-y-3">
          {items.map((c) => (
            <MotionItem
              key={c.id}
              className={`relative bg-surface backdrop-blur-xl border rounded-xl transition-all duration-300 ${isWidget ? 'p-4' : 'p-5'} ${
                c.urgency === 'HIGH'
                  ? 'border-red-500/50 hover:bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  : 'border-border hover:bg-surface-hover/40 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className={`text-text-secondary font-medium leading-relaxed ${isWidget ? 'text-sm line-clamp-2' : 'text-lg'}`}>
                    {c.complaint}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(c.created_at)}</span>
                    </div>
                    
                    {c.category && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                        {c.category}
                      </span>
                    )}
                    
                    {c.urgency === 'HIGH' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold flex items-center gap-1">
                        🔥 HIGH URGENCY
                      </span>
                    )}
                    {c.urgency === 'MEDIUM' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30 font-medium flex items-center gap-1">
                        ⚡ MEDIUM
                      </span>
                    )}
                    {c.urgency === 'LOW' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30 font-medium flex items-center gap-1">
                        💤 LOW
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => upvote(c.id)}
                  disabled={upvoting === c.id}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-md border transition-colors disabled:opacity-50 group ${c.current_user_has_upvoted
                    ? "bg-primary/10 border-primary/30"
                    : "bg-transparent border-border hover:bg-primary/10 hover:border-primary/30"
                    } ${isWidget ? '' : 'flex-col min-w-[60px]'}`}
                >
                  <span className={`text-sm font-bold ${c.current_user_has_upvoted ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'} ${upvoting === c.id ? 'animate-pulse' : ''}`}>
                    {c.upvotes}
                  </span>
                  <ThumbsUp className={`w-3.5 h-3.5 ${c.current_user_has_upvoted ? "text-primary" : "text-text-muted group-hover:text-primary"} ${upvoting === c.id ? 'text-primary' : ''}`} />
                </button>
              </div>
            </MotionItem>
          ))}
        </MotionList>
      )}

      {/* --- LOAD MORE BUTTON --- */}
      {!isWidget && items.length === limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((prev) => prev + 10)}
            className="px-6 py-2.5 bg-surface border border-border rounded-xl text-text-primary hover:bg-surface-hover hover:border-primary/50 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
