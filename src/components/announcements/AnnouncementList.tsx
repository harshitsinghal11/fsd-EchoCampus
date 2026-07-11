"use client";
import { useState, useMemo } from "react";
import { User, ExternalLink } from "lucide-react";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useAnnouncements } from "@/hooks/data/useAnnouncements";
import { EmptyAnnouncements, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useEffect } from "react";

interface AnnouncementListProps {
  isWidget?: boolean;
}

export default function AnnouncementList({ isWidget = false }: AnnouncementListProps) {
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { items, isLoading } = useAnnouncements(isWidget, debouncedSearchTerm, isWidget ? undefined : limit);

  const displayItems = items;

  const handleLoadMore = () => {
    setLimit(prev => prev + 10);
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col w-full ${isWidget ? "py-10" : "py-20"}`}>
        <p className="text-center text-text-disabled animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {!isWidget && (
        <div className="mb-6">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search announcements..."
            className="w-full max-w-md"
          />
        </div>
      )}

      <MotionList className="space-y-4 pr-2 custom-scrollbar h-full overflow-y-auto w-full">
        {items.length === 0 && <EmptyAnnouncements isWidget={isWidget} />}
        {items.length > 0 && displayItems.length === 0 && <EmptySearch searchTerm={searchTerm} />}

        {displayItems.map((item) => (
        <MotionItem
          key={item.id}
          className={`border w-full flex flex-col transition-all duration-300 ${isWidget
            ? "bg-surface-hover/60 p-4 rounded-xl border-border hover:bg-surface-hover"
            : "group relative bg-surface p-5 sm:p-6 rounded-2xl border-border shadow-sm hover:shadow-md hover:border-primary/50 hover:shadow-primary/10 hover:bg-surface-hover/40"
            }`}
        >
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-start justify-between gap-4">
              <h4 className={`font-bold text-text-primary group-hover:text-primary transition-colors flex-1 ${isWidget ? "text-sm line-clamp-1" : "text-lg md:text-xl"}`}>
                {item.title}
              </h4>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-light transition-colors ${isWidget ? "text-[10px] md:text-xs" : "text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20"
                    }`}
                >
                  <ExternalLink className={isWidget ? "w-3 h-3" : "w-3.5 h-3.5"} />
                  {isWidget ? "Open Link" : "View Link"}
                </a>
              )}
            </div>

            <p className={`text-text-muted ${isWidget ? "text-xs line-clamp-2" : "text-sm md:text-base leading-relaxed whitespace-pre-wrap"}`}>
              {item.content}
            </p>

            {!isWidget && (
              <div className="mt-2 pt-3 border-t border-border/60 text-xs text-text-secondary flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-text-disabled shrink-0" />
                  <span className="font-medium">{item.users?.full_name || "Faculty"}</span>
                </div>
              </div>
            )}
          </div>
        </MotionItem>
      ))}
    </MotionList>

      {/* --- LOAD MORE BUTTON --- */}
      {!isWidget && items.length === limit && displayItems.length > 0 && !searchTerm && (
        <div className="flex justify-center mt-6 h-10 items-center">
          <button onClick={handleLoadMore} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            Load more announcements...
          </button>
        </div>
      )}
    </div>
  );
}
