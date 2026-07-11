'use client';
import { useState, useMemo } from "react";
import { ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { ComplaintSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useComplaints } from "@/hooks/data/useComplaints";
import { EmptyComplaints, EmptySearch } from "@/components/shared/EmptyStates";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useEffect } from "react";

type UpvoteApiResponse = {
  added?: boolean;
  current_user_has_upvoted?: boolean;
  upvotes?: number;
};

interface ComplaintListProps {
  isWidget?: boolean;
  searchTerm?: string;
  urgencyFilter?: string;
}

export default function ComplaintList({ isWidget = false, searchTerm = "", urgencyFilter = "ALL" }: ComplaintListProps) {
  const [limit, setLimit] = useState(10);
  const { items, isLoading, mutate } = useComplaints(isWidget, isWidget ? undefined : limit);
  const [upvoting, setUpvoting] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleLoadMore = () => {
    setLimit(prev => prev + 10);
  };

  const displayItems = useMemo(() => {
    if (isWidget) return items;
    let filtered = items;

    if (urgencyFilter !== "ALL") {
      filtered = filtered.filter(item => item.urgency === urgencyFilter);
    }

    const q = debouncedSearchTerm.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(item => {
        const hay = [
          item.complaint,
          item.category ?? "",
        ].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return filtered;
  }, [items, debouncedSearchTerm, urgencyFilter, isWidget]);

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
      <div className={`flex-1 flex flex-col w-full h-full overflow-y-auto ${isWidget ? '' : 'bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm'}`}>
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
    <div className={`flex-1 flex flex-col w-full h-full overflow-y-auto ${isWidget ? '' : 'bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-sm'}`}>
      {!isLoading && !isWidget && items.length > 0 && displayItems.length === 0 && (
        <EmptySearch searchTerm={searchTerm} />
      )}

      {items.length === 0 ? (
        <EmptyComplaints isWidget={isWidget} />
      ) : displayItems.length > 0 && (
        <MotionList className="space-y-3">
          {displayItems.map((c) => (
            <MotionItem
              key={c.id}
              className={isWidget ? 'p-4' : 'p-5 sm:p-6 border border-border rounded-lg'}>
              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <p className={`text-text-primary font-medium leading-relaxed ${isWidget ? 'text-sm line-clamp-2' : 'text-lg'}`}>
                    {c.complaint}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-text-muted">
                    {c.category && (
                      <>
                        <span>{c.category}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center">
                    {c.urgency === 'HIGH' && (
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-red-500">
                        🔥 High
                      </span>
                    )}
                    {c.urgency === 'MEDIUM' && (
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-orange-500">
                        ⚡ Medium
                      </span>
                    )}
                    {c.urgency === 'LOW' && (
                      <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-500">
                        💤 Low
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => upvote(c.id)}
                    disabled={upvoting === c.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 group ${c.current_user_has_upvoted
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-hover text-text-secondary hover:bg-surface-hover/80 hover:text-text-primary"
                      }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${c.current_user_has_upvoted ? "text-primary" : "text-text-muted group-hover:text-text-primary"} ${upvoting === c.id ? 'text-primary' : ''}`} />
                    <span className={`text-sm font-bold ${upvoting === c.id ? 'animate-pulse' : ''}`}>
                      {c.upvotes}
                    </span>
                  </button>
                </div>
              </div>
            </MotionItem>
          ))}
        </MotionList>
      )}

      {/* --- LOAD MORE BUTTON --- */}
      {!isWidget && items.length === limit && displayItems.length > 0 && !searchTerm && (
        <div className="flex justify-center mt-6 h-10 items-center">
          <button onClick={handleLoadMore} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            Load more complaints...
          </button>
        </div>
      )}
    </div>
  );
}
