"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Camera, ArrowRight, CheckCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { LostFoundSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useLostFound } from "@/hooks/data/useLostFound";
import { EmptyLostFound, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { resolveLostFoundItem, deleteLostFoundItem } from "@/actions/lostFoundActions";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { Modal } from "@/components/ui/Modal";

interface LostFoundListProps {
  refreshTrigger?: number;
  showSearch?: boolean; // If false, renders as a compact "Widget" for dashboards
}

export default function LostFoundList({
  refreshTrigger,
  showSearch = true
}: LostFoundListProps) {

  const { limit, loadMore } = usePagination(12, 12);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const { items, isLoading, mutate } = useLostFound(!showSearch, !showSearch ? undefined : limit);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const displayItems = useMemo(() => {
    if (!showSearch) return items;
    const q = debouncedSearchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.title,
        item.description ?? "",
        item.location_found,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, debouncedSearchTerm, showSearch]);


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


  const toggleResolveStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionName = newStatus ? "resolved" : "active";
    if (!confirm(`Are you sure you want to mark this item as ${actionName}?`)) return;

    // Optimistic UI update
    mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return currentData.map(item =>
          item.id === id ? { ...item, is_resolved: newStatus } : item
        );
      },
      { revalidate: false }
    );

    const result = await resolveLostFoundItem(id, newStatus);
    if (result.error) {
      toast.error("Error: " + result.error);
      mutate(); // rollback
    } else {
      toast.success(`Item marked as ${actionName}!`);
      mutate();
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;

    const result = await deleteLostFoundItem(id, imageUrl);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Report deleted successfully");
      mutate();
    }
  };

  return (
    <>
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
          <MotionList className={!showSearch ? "flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5" : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pr-1 sm:pr-2 custom-scrollbar w-full items-stretch"}>
            {displayItems.map((item) => (
              <MotionItem
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`
              group overflow-hidden transition-all duration-300 w-full relative
              ${!showSearch
                    ? 'bg-surface hover:bg-surface-hover/80 rounded-lg p-3 flex items-center gap-3 border border-transparent cursor-pointer'
                    : 'bg-surface border-border rounded-lg p-3 sm:p-5 md:p-6 flex flex-col h-full border'
                  }
            `}
              >
                {/* 1. IMAGE THUMBNAIL */}
                <div className={`
              bg-surface-hover shrink-0 overflow-hidden border border-border flex items-center justify-center relative
              ${!showSearch ? 'rounded-md w-16 h-16' : 'rounded-md w-full aspect-[4/3] sm:aspect-video mb-3 sm:mb-4'}
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
                {!showSearch ? (
                  // WIDGET MODE CONTENT
                  <div className="flex-1 min-w-0 flex flex-col grow justify-center">
                    <h2 className="font-semibold line-clamp-1 text-sm text-text-primary">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.location_found}</span>
                    </div>
                  </div>
                ) : (
                  // FULL MODE CONTENT (Matches Marketplace)
                  <>
                    <div className="flex justify-between items-start gap-2 sm:gap-3">
                      <h2 className={`font-semibold line-clamp-1 text-base md:text-lg ${item.is_resolved ? 'text-text-muted' : 'text-text-primary'}`}>
                        {item.title}
                      </h2>

                      {item.is_resolved ? (
                        <span className="shrink-0 inline-flex items-center gap-1 bg-surface-hover/80 text-text-muted text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="shrink-0 bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col w-full">
                      <p className={`text-text-muted mt-2 leading-relaxed text-sm line-clamp-1`}>
                        {item.description || "No additional description."}
                      </p>
                      {item.description && item.description.length > 150 && (
                        <span className="text-primary text-xs font-medium mt-1 ml-auto hover:underline">
                          Read more...
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/60 text-xs text-text-secondary flex flex-row justify-between items-center gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-text-disabled shrink-0" />
                        <span className="truncate">{item.location_found}</span>
                      </div>

                      {item.contact_info && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-text-disabled shrink-0" />
                          <span>{item.contact_info}</span>
                        </div>
                      )}
                    </div>


                  </>
                )}

                {/* Widget Mode Indicators */}
                {!showSearch && (
                  <>
                    <ArrowRight className="shrink-0 w-4 h-4 text-text-disabled group-hover:text-primary transition-all mr-1" />
                    <div className="absolute bottom-1.5 right-2 mt-1">
                      <span className="text-xs text-text-disabled font-medium">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </>
                )}

              </MotionItem>
            ))}
          </MotionList>
        )}

        {/* --- LOAD MORE BUTTON --- */}
        {showSearch && items.length === limit && displayItems.length > 0 && !searchTerm && (
          <div className="flex justify-center mt-6 h-10 items-center">
            <button onClick={loadMore} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
              Load more items...
            </button>
          </div>
        )}
      </div>

      {/* Modal for viewing full details */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || "Item Details"}
      >
        {selectedItem && (
          <div className="flex flex-col gap-4">
            {selectedItem.image_url && (
              <div className="w-full relative aspect-video bg-surface-hover border border-border rounded-lg overflow-hidden mb-2">
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-text-secondary border-b border-border/50 pb-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">{selectedItem.location_found}</span>
            </div>

            <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap leading-relaxed">
              {selectedItem.description || "No description provided."}
            </p>

            <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
              {selectedItem.contact_info && (
                <div className="flex items-center gap-2 text-text-primary">
                  <Phone className="w-4 h-4 text-text-disabled" />
                  <span className="font-sm">Contact: {selectedItem.contact_info}</span>
                </div>
              )}
              {selectedItem.is_resolved && (
                <div className="flex items-center gap-2 text-primary mt-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold">Item marked as resolved</span>
                </div>
              )}
            </div>

            {currentUserId === selectedItem.user_id && (
              <div className="pt-4 border-t border-border/50 flex items-center gap-2 w-full">
                <button
                  onClick={() => toggleResolveStatus(selectedItem.id, selectedItem.is_resolved)}
                  className={`flex-1 font-medium px-4 py-2 rounded-xl transition-all duration-200 text-sm hover:shadow-lg bg-surface-hover hover:bg-surface-hover/80 text-text-primary border border-border`}
                >
                  {selectedItem.is_resolved ? "Mark as Active" : "Mark as Resolved"}
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedItem.id, selectedItem.image_url);
                    setSelectedItem(null);
                  }}
                  className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                  title="Delete Report"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
