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
  const { items, isLoading, mutate } = useComplaints(isWidget);
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
      <div className={`flex-1 flex flex-col overflow-y-auto ${isWidget ? '' : 'bg-surface backdrop-blur-xl border border-border rounded-xl p-6'}`}>
        {!isWidget && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" />
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
    <div className={`flex-1 flex flex-col overflow-y-auto ${isWidget ? '' : 'bg-surface backdrop-blur-xl border border-border rounded-xl p-6'}`}>

      {!isWidget && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
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
              className={`bg-surface backdrop-blur-xl border border-border rounded-xl hover:bg-surface-hover/40 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 ${isWidget ? 'p-4' : 'p-4'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className={`text-text-secondary font-medium leading-relaxed ${isWidget ? 'text-sm line-clamp-2' : 'text-lg'}`}>
                    &quot;{c.complaint}&quot;
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(c.created_at)}</span>
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
    </div>
  );
}
