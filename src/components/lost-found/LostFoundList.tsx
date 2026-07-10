"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Calendar, Camera, Trash2, ArrowRight, Search, CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { LostFoundSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useLostFound } from "@/hooks/data/useLostFound";
import { EmptyLostFound, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { deleteLostFoundItem, resolveLostFoundItem } from "@/actions/lostFoundActions";
import { useDebounce } from "@/hooks/useDebounce";

interface LostFoundListProps {
  refreshTrigger?: number;
  showSearch?: boolean; // If false, renders as a compact "Widget" for dashboards
}

export default function LostFoundList({
  refreshTrigger,
  showSearch = true
}: LostFoundListProps) {

  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { items, isLoading, mutate } = useLostFound(!showSearch, debouncedSearchTerm, !showSearch ? undefined : limit);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const displayItems = items;

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    fetchUser();
  }, []);

  // Use refreshTrigger to mutate if a new item is added
  useEffect(() => {
    if (refreshTrigger) {
      mutate();
    }
  }, [refreshTrigger, mutate]);

  const handleDelete = async (id: string, imageUrl: string | null) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    const result = await deleteLostFoundItem(id, imageUrl);
    if (result.error) toast.error("Error: " + result.error);
    else {
      toast.success("Item removed");
      mutate();
    }
  };

  const handleResolve = async (id: string) => {
    const confirm = window.confirm("Has this item been returned/resolved?");
    if (!confirm) return;

    const result = await resolveLostFoundItem(id);
    if (result.error) toast.error("Error: " + result.error);
    else {
      toast.success("Item marked as resolved!");
      mutate();
    }
  };

  return (
    <div className={`space-y-6 ${!showSearch ? 'h-full flex flex-col' : ''}`}>

      {/* --- SEARCH BAR --- */}
      {showSearch && (
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search lost items..."
          className="w-full"
        />
      )}

      {/* --- LOADING STATE --- */}
      {isLoading && (
        <LostFoundSkeleton isWidget={!showSearch} />
      )}

      {/* --- EMPTY STATE (no data) --- */}
      {!isLoading && items.length === 0 && (
        <EmptyLostFound isWidget={!showSearch} />
      )}

      {/* --- NO SEARCH MATCHES --- */}
      {!isLoading && showSearch && items.length > 0 && displayItems.length === 0 && (
        <EmptySearch searchTerm={searchTerm} />
      )}

      {/* --- LIST LAYOUT --- */}
      {displayItems.length > 0 && (
        <MotionList className={!showSearch ? "flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5" : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 pr-1 sm:pr-2 custom-scrollbar w-full"}>
          {displayItems.map((item) => (
            <MotionItem
              key={item.id}
              className={`
              group overflow-hidden transition-all duration-300 w-full relative
              ${!showSearch
                  ? 'bg-surface hover:bg-surface-hover/80 rounded-xl p-3 flex items-center gap-3 border border-transparent hover:border-border cursor-pointer'
                  : 'bg-surface border-border shadow-sm hover:shadow-md hover:shadow-primary/10 hover:bg-surface-hover/40 hover:border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 flex flex-col h-full border'
                }
            `}
            >
              {/* RESOLVED BADGE */}
              {item.is_resolved && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-primary/20 backdrop-blur-md text-primary px-2.5 py-1 rounded-full border border-primary/30 shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Resolved</span>
                </div>
              )}

              {/* 1. IMAGE THUMBNAIL */}
              <div className={`
              bg-surface-hover shrink-0 overflow-hidden border border-border flex items-center justify-center relative
              ${!showSearch ? 'rounded-lg w-16 h-16' : 'rounded-lg sm:rounded-xl w-full aspect-[4/3] sm:aspect-video mb-3 sm:mb-4'}
            `}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt="Item"
                    fill
                    unoptimized
                    sizes={!showSearch ? "64px" : "(max-width: 768px) 50vw, 33vw"}
                    className="object-contain transition-duration-500 p-1"
                  />
                ) : (
                  <Camera className={`text-text-disabled ${!showSearch ? 'w-6 h-6' : 'w-8 h-8'}`} />
                )}
              </div>

              {/* 2. CONTENT */}
              <div className="flex-1 min-w-0 flex flex-col grow justify-between">
                <div>
                  {/* Header: Title + Date + Delete */}
                  <div className="flex justify-between items-start gap-2 sm:gap-3">
                    <h2 className={`font-semibold line-clamp-1 ${!showSearch ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} text-text-primary group-hover:text-primary-light transition-colors`}>
                      {item.title}
                    </h2>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Action Button */}
                      {showSearch && currentUserId === item.user_id && !item.is_resolved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(item.id);
                          }}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-primary text-[10px] sm:text-[11px] font-bold rounded-md transition-all shrink-0"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location (Widget Only) */}
                  {!showSearch && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.location_found}</span>
                    </div>
                  )}

                  {/* Full Details (Full Page Only) */}
                  {showSearch && (
                    <p className={`text-text-muted mt-1.5 sm:mt-2 leading-relaxed text-[10px] sm:text-xs md:text-sm line-clamp-2 sm:line-clamp-3`}>
                      {item.description || "No additional description."}
                    </p>
                  )}
                </div>

                {showSearch && (
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-4 border-t border-border/60 text-xs text-text-secondary flex flex-row justify-between items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-disabled shrink-0" />
                      <span className="truncate text-[10px] sm:text-xs max-w-[100px] sm:max-w-[200px]">{item.location_found}</span>
                    </div>

                    {item.contact_info && (
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-disabled shrink-0" />
                        <span className="text-[10px] sm:text-xs">{item.contact_info}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Widget Mode: Chevron for "Go" indication */}
              {!showSearch && (
                <ArrowRight className="shrink-0 w-4 h-4 text-text-disabled group-hover:text-primary transition-all mr-1" />
              )}

              {/* Simple Timestamp for Widget Mode */}
              {!showSearch && (
                <div className="absolute bottom-1.5 right-2 mt-1">
                  <span className="text-[9px] sm:text-[10px] text-text-disabled font-medium">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

            </MotionItem>
          ))}
        </MotionList>
      )}

      {/* --- LOAD MORE BUTTON --- */}
      {showSearch && items.length === limit && displayItems.length > 0 && !searchTerm && (
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
