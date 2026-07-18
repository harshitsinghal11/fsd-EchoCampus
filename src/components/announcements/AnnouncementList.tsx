"use client";
import { useState, } from "react";
import { User, ExternalLink } from "lucide-react";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useAnnouncements } from "@/hooks/data/useAnnouncements";
import { EmptyAnnouncements, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { Modal } from "@/components/ui/Modal";
import { Announcement } from "@/types/announcements";

interface AnnouncementListProps {
  isWidget?: boolean;
  widgetLimit?: number;
}

export default function AnnouncementList({ isWidget = false, widgetLimit }: AnnouncementListProps) {
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { items, isLoading } = useAnnouncements(isWidget, debouncedSearchTerm, isWidget ? widgetLimit : limit);

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

      <MotionList className={isWidget ? "space-y-4 pr-2 custom-scrollbar h-full overflow-y-auto w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full h-full overflow-y-auto custom-scrollbar pr-2"}>
        {items.length === 0 && <EmptyAnnouncements isWidget={isWidget} />}
        {items.length > 0 && displayItems.length === 0 && <EmptySearch searchTerm={searchTerm} />}

        {displayItems.map((item) => (
          <MotionItem
            key={item.id}
            onClick={() => setSelectedAnnouncement(item)}
            className={`border w-full flex flex-col cursor-pointer transition-colors ${isWidget
              ? "bg-surface-hover/60 p-4 rounded-xl border-border hover:bg-surface-hover"
              : "bg-surface p-5 sm:p-6 rounded-2xl border-border shadow-sm hover:bg-surface-hover/40"
              }`}
          >
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-start justify-between gap-4">
                <h4 className={`font-semibold text-text-primary flex-1 ${isWidget ? "text-sm line-clamp-1" : "text-base md:text-lg line-clamp-2"}`}>
                  {item.title}
                </h4>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`shrink-0 inline-flex items-center gap-1.5 font-medium text-primary ${isWidget ? "text-[10px] md:text-xs" : "text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
                      }`}
                  >
                    <ExternalLink className={isWidget ? "w-3 h-3" : "w-3.5 h-3.5"} />
                    {isWidget ? "Open Link" : "View Link"}
                  </a>
                )}
              </div>

              <div className="flex flex-col w-full">
                <p className={`text-text-muted ${isWidget ? "text-xs line-clamp-2" : "text-sm line-clamp-3 leading-relaxed whitespace-pre-wrap"}`}>
                  {item.content}
                </p>
                {item.content.length > (isWidget ? 100 : 150) && (
                  <span className="text-primary text-xs font-medium mt-1.5 ml-auto hover:underline">
                    Read more...
                  </span>
                )}
              </div>

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
      {/* Modal for viewing full announcement */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || "Announcement Details"}
      >
        {selectedAnnouncement && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm text-text-secondary border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-disabled" />
                <span className="font-medium">{selectedAnnouncement.users?.full_name || "Faculty"}</span>
              </div>
              <span className="text-xs font-medium bg-surface-hover px-2 py-1 rounded-md">{new Date(selectedAnnouncement.created_at).toLocaleDateString()}</span>
            </div>

            <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap leading-relaxed">
              {selectedAnnouncement.content}
            </p>

            {selectedAnnouncement.link && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <a
                  href={selectedAnnouncement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary-light transition-colors bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/20 w-fit"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Attached Link
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}