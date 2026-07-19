"use client";
import { useState, useEffect } from "react";
import { User, ExternalLink, Calendar, Star, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toggleStarAnnouncement, deleteAnnouncement } from "@/actions/announcementActions";
import { supabase } from "@/lib/supabaseClient";
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
  const [limit, setLimit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { items, isLoading, mutate } = useAnnouncements(isWidget, debouncedSearchTerm, isWidget ? widgetLimit : limit);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    });
  }, []);

  const generateGoogleCalendarUrl = (announcement: Announcement) => {
    const title = encodeURIComponent(announcement.title);
    const details = encodeURIComponent(announcement.content);
    const startDate = announcement.event_start_date ? new Date(announcement.event_start_date) : new Date(announcement.created_at);
    const endDate = announcement.event_end_date ? new Date(announcement.event_end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatForGCal = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dates = `${formatForGCal(startDate)}/${formatForGCal(endDate)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  const handleToggleStar = async (announcement: Announcement) => {
    const newStarredStatus = !announcement.is_starred;

    // Optimistic UI update
    mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return currentData.map(item =>
          item.id === announcement.id ? { ...item, is_starred: newStarredStatus } : item
        );
      },
      { revalidate: false }
    );

    setSelectedAnnouncement(prev => prev && prev.id === announcement.id ? { ...prev, is_starred: newStarredStatus } : prev);

    const result = await toggleStarAnnouncement(announcement.id, newStarredStatus);
    if (result.error) {
      toast.error(result.error);
      mutate(); // rollback
    } else {
      toast.success(newStarredStatus ? "Added to favorites!" : "Removed from favorites!");
      mutate();
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) return;

    setIsDeleting(true);
    const result = await deleteAnnouncement(announcementId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Announcement deleted successfully!");
      setSelectedAnnouncement(null);
      mutate();
    }
    setIsDeleting(false);
  };

  const displayItems = items.filter(item => filter === "all" || item.is_starred);

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
    <div className={`flex flex-col w-full ${isWidget ? '' : 'h-full'}`}>
      {!isWidget && (
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search announcements..."
            className="w-full max-w-md"
          />
          <div className="flex bg-surface-hover p-1 rounded-xl w-full md:w-auto shrink-0 border border-border/50">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-surface shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            >
              All Announcements
            </button>
            <button
              onClick={() => setFilter("starred")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${filter === "starred" ? "bg-surface shadow-sm text-yellow-500" : "text-text-secondary hover:text-yellow-500"}`}
            >
              <Star className={`w-4 h-4 ${filter === "starred" ? "fill-yellow-500" : ""}`} />
              Starred
            </button>
          </div>
        </div>
      )}

      <MotionList className={isWidget ? "space-y-4 pr-2 w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full h-full overflow-y-auto custom-scrollbar pr-2"}>
        {items.length === 0 && (
          <div className="col-span-full">
            <EmptyAnnouncements isWidget={isWidget} />
          </div>
        )}
        {items.length > 0 && displayItems.length === 0 && (
          <div className="col-span-full">
            <EmptySearch searchTerm={searchTerm} />
          </div>
        )}

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
                <h4 className={`font-semibold text-text-primary flex-1 ${isWidget ? "text-sm line-clamp-1" : "text-base md:text-lg line-clamp-2"} ${item.is_starred ? 'text-yellow-500' : ''}`}>
                  {item.title}
                </h4>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`shrink-0 inline-flex items-center gap-1.5 font-medium text-primary ${isWidget ? "text-[10px] md:text-xs" : "text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-lg"
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

            {selectedAnnouncement.event_start_date && (
              <div className="flex items-center gap-2 text-sm text-primary mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">
                  Event: {new Date(selectedAnnouncement.event_start_date).toLocaleDateString(undefined, {
                    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
                  })}
                  {selectedAnnouncement.event_end_date && selectedAnnouncement.event_end_date !== selectedAnnouncement.event_start_date && ` - ${new Date(selectedAnnouncement.event_end_date).toLocaleDateString(undefined, {
                    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
                  })}`}
                </span>
              </div>
            )}

            <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap leading-relaxed">
              {selectedAnnouncement.content}
            </p>

            <div className="pt-4 border-t border-border/50 flex flex-col gap-3 w-full mt-2">
              {/* Attachment - Full Width (Above Buttons) */}
              {selectedAnnouncement.link && (
                <a
                  href={selectedAnnouncement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 font-medium text-primary hover:text-primary-light transition-colors bg-primary/10 px-4 h-11 rounded-xl border border-primary/20 hover:bg-primary/20"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Attachment
                </a>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 w-full">
                <a
                  href={generateGoogleCalendarUrl(selectedAnnouncement)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 font-medium text-text-primary hover:text-text-primary transition-colors bg-surface-hover hover:bg-surface-hover/80 px-4 h-11 rounded-xl border border-border"
                >
                  <Calendar className="w-4 h-4" />
                  Add to Calendar
                </a>

                <button
                  onClick={() => handleToggleStar(selectedAnnouncement)}
                  className="rounded-xl text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all shrink-0 h-11 w-11 flex items-center justify-center"
                  title={selectedAnnouncement.is_starred ? "Remove Star" : "Star Announcement"}
                >
                  <Star className={`w-5 h-5 ${selectedAnnouncement.is_starred ? "fill-yellow-500" : ""}`} />
                </button>

                {currentUserId === selectedAnnouncement.author_id && (
                  <button
                    onClick={() => handleDelete(selectedAnnouncement.id)}
                    disabled={isDeleting}
                    className="rounded-xl text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-all shrink-0 h-11 w-11 flex items-center justify-center disabled:opacity-50"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
