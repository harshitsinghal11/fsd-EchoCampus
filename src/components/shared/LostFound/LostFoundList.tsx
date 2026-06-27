"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Calendar, Camera, Trash2, ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { LostFoundSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useLostFound } from "@/hooks/data/useLostFound";
import { EmptyLostFound, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { deleteLostFoundItem } from "@/actions/lostFoundActions";

interface LostFoundListProps {
  refreshTrigger?: number;
  showSearch?: boolean; // If false, renders as a compact "Widget" for dashboards
}

export default function LostFoundList({
  refreshTrigger,
  showSearch = true
}: LostFoundListProps) {

  const { items, isLoading, mutate } = useLostFound(!showSearch);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const displayItems = useMemo(() => {
    if (!showSearch) return items;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.title,
        item.description ?? "",
        item.location_found,
        item.contact_info,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchTerm, showSearch]);

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
    const confirm = window.confirm("Has this item been returned? This post will be deleted.");
    if (!confirm) return;

    const result = await deleteLostFoundItem(id, imageUrl);
    if (result.error) toast.error("Error: " + result.error);
    else {
      toast.success("Item removed");
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
        <MotionList className={!showSearch ? "flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5" : "space-y-4 pr-2 custom-scrollbar w-full"}>
          {displayItems.map((item) => (
            <MotionItem
              key={item.id}
              className={`
              group overflow-hidden transition-all duration-300 w-full
              ${!showSearch
                  ? 'bg-surface hover:bg-surface-hover/80 rounded-xl p-3 flex items-center gap-3 border border-transparent hover:border-border cursor-pointer'
                  : 'bg-surface backdrop-blur-xl rounded-xl p-4 flex flex-col sm:flex-row gap-4 border border-border shadow-md hover:bg-surface-hover hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:bg-surface-hover/40'
                }
            `}
            >

              {/* 1. IMAGE THUMBNAIL */}
              <div className={`
              bg-surface-hover shrink-0 overflow-hidden border border-border flex items-center justify-center relative
              ${!showSearch ? 'rounded-lg w-16 h-16' : 'rounded-xl w-full sm:w-28 h-40 sm:h-28'}
            `}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt="Item"
                    fill
                    unoptimized
                    sizes={!showSearch ? "64px" : "(max-width: 768px) 100vw, 112px"}
                    className="object-cover transition-duration-500"
                  />
                ) : (
                  <Camera className={`text-text-disabled ${!showSearch ? 'w-6 h-6' : 'w-8 h-8'}`} />
                )}
              </div>

              {/* 2. CONTENT */}
              <div className="flex-1 min-w-0 flex flex-col justify-center py-1">

                {/* Header: Title + Date */}
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <h3 className={`font-bold truncate group-hover:text-primary-light transition-colors ${!showSearch ? 'text-sm text-text-primary' : 'text-lg md:text-xl text-text-primary line-clamp-1'}`}>
                    {item.title}
                  </h3>

                  {/* Date Badge */}
                  <span className={`
                  shrink-0 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5
                  ${!showSearch
                      ? 'text-text-disabled'
                      : 'bg-surface text-text-muted px-2.5 py-1 rounded-lg border border-border'
                    }
                `}>
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Location (Widget Only) */}
                {!showSearch && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary/70" />
                    <span className="truncate">{item.location_found}</span>
                  </div>
                )}

                {/* Full Details (Full Page Only) */}
                {showSearch && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2 mt-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface text-text-secondary border border-border">
                        <MapPin className="w-3 h-3 text-primary" />
                        {item.location_found}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface text-text-secondary border border-border">
                        <Phone className="w-3 h-3 text-primary" />
                        {item.contact_info}
                      </span>
                    </div>

                    <p className="text-text-muted text-xs md:text-sm leading-relaxed line-clamp-2 mb-2">
                      {item.description || "No additional description."}
                    </p>

                    {/* Action Footer */}
                    {currentUserId === item.user_id && (
                      <div className="mt-auto pt-3 border-t border-border/50 flex justify-end">
                        <button
                          onClick={() => handleDelete(item.id, item.image_url)}
                          className="flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger hover:text-danger text-xs font-bold rounded-xl transition-all group/btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Found / Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Widget Mode: Chevron for "Go" indication */}
              {!showSearch && (
                <ArrowRight className="shrink-0 w-4 h-4 text-text-disabled group-hover:text-primary transition-all mr-1" />
              )}

            </MotionItem>
          ))}
        </MotionList>
      )}
    </div>
  );
}
