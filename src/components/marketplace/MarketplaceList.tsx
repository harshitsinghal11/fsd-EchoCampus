"use client";
import { useState, useMemo } from 'react';
import Image from "next/image";
import { User, Phone, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';
import { MarketplaceSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useMarketplace } from "@/hooks/data/useMarketplace";
import { EmptyMarketplace, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { Modal } from "@/components/ui/Modal";
import { deleteMarketplaceItem } from "@/actions/marketplaceActions";

interface MarketListProps {
  currentUserEmail?: string;
  isWidget?: boolean;
}

export default function MarketList({ currentUserEmail, isWidget = false }: MarketListProps) {
  const { limit, loadMore } = usePagination(12, 12);
  const { items, isLoading, mutate } = useMarketplace(isWidget, isWidget ? undefined : limit);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);


  const displayItems = useMemo(() => {
    if (isWidget) return items;
    const q = debouncedSearchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.product_title,
        item.description ?? "",
        item.owner_name,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, debouncedSearchTerm, isWidget]);

  async function toggleSoldStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    const actionName = newStatus ? "sold" : "active";
    if (!confirm(`Are you sure you want to mark this item as ${actionName}?`)) return;

    // Optimistic UI update
    mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return currentData.map(item =>
          item.id === id ? { ...item, is_sold: newStatus } : item
        );
      },
      { revalidate: false }
    );

    try {
      const { error } = await supabase
        .from("marketplace")
        .update({ is_sold: newStatus })
        .eq("id", id);

      if (!error) {
        toast.success(`Item marked as ${actionName}`);
        mutate();
      } else {
        toast.error("Failed to update status: " + (error instanceof Error ? error.message : String(error)));
        mutate(); // rollback
      }
    } catch (error: unknown) {
      toast.error("Network error.");
      mutate(); // rollback
    }
  }

  async function handleDelete(id: string, imageUrl: string | null) {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

    const result = await deleteMarketplaceItem(id, imageUrl);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Listing deleted successfully");
      mutate();
    }
  }

  if (isLoading) return <MarketplaceSkeleton isWidget={isWidget} />;

  if (items.length === 0) return <EmptyMarketplace isWidget={isWidget} />;

  return (
    <div className={`space-y-6 ${isWidget ? 'h-full flex flex-col' : ''}`}>
      {/* --- SEARCH BAR --- */}
      {!isWidget && (
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search items..."
          className="w-full"
        />
      )}

      {/* --- NO SEARCH MATCHES --- */}
      {!isLoading && !isWidget && items.length > 0 && displayItems.length === 0 && (
        <EmptySearch searchTerm={searchTerm} />
      )}

      {displayItems.length > 0 && (
        <MotionList className={`grid gap-3 sm:gap-4 md:gap-6 items-stretch ${isWidget
          ? "grid-cols-2"
          : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          }`}>
          {displayItems.map((item) => (
            <MotionItem
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`relative overflow-hidden rounded-lg p-3 sm:p-5 md:p-6 border transition-all duration-300 flex flex-col h-full cursor-pointer ${item.is_sold
                ? "bg-surface border-border opacity-75 grayscale-30"
                : "bg-surface border-border"
                }`}
            >
              {/* IMAGE THUMBNAIL */}
              {item.image_url && (
                <div className={`
              bg-surface-hover shrink-0 overflow-hidden border border-border flex items-center justify-center relative mb-3 sm:mb-4
              rounded-md w-full aspect-[4/3] sm:aspect-video
            `}>
                  <Image
                    src={item.image_url}
                    alt={item.product_title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-duration-500"
                  />
                </div>
              )}

              <div className="flex justify-between items-start gap-2 sm:gap-3">
                <h2 className={`font-semibold line-clamp-2 ${isWidget ? 'text-sm' : 'text-base md:text-lg'} ${item.is_sold ? 'text-text-muted' : 'text-text-primary group-hover:text-primary-light transition-colors'}`}>
                  {item.product_title}
                </h2>

                {item.is_sold ? (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-surface-hover/80 text-text-muted border border-border text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <CheckCircle className="w-3 h-3" />
                    Sold
                  </span>
                ) : (
                  <span className="shrink-0 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              <p className={`font-bold mt-2 ${isWidget ? 'text-base' : 'text-lg'} ${item.is_sold ? 'text-text-disabled' : 'text-primary'}`}>
                ₹{item.price.toLocaleString('en-IN')}
              </p>

              <div className="flex flex-col w-full">
                <p className={`text-text-muted mt-2 leading-relaxed ${isWidget ? 'text-xs line-clamp-2' : 'text-sm line-clamp-2 sm:line-clamp-3'}`}>
                  {item.description}
                </p>
                {item.description && item.description.length > (isWidget ? 100 : 150) && (
                  <span className="text-primary text-xs font-medium mt-1 ml-auto hover:underline">
                    Read more...
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-border/60 text-xs text-text-secondary flex flex-row justify-between items-center gap-2 w-full">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-disabled shrink-0" />
                  <span className="truncate">{item.owner_name}</span>
                </div>

                {!isWidget && item.contact_info && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-disabled shrink-0" />
                    <span>{item.contact_info}</span>
                  </div>
                )}
              </div>


            </MotionItem>
          ))}
        </MotionList>
      )}

      {/* --- LOAD MORE BUTTON --- */}
      {!isWidget && items.length === limit && displayItems.length > 0 && !searchTerm && (
        <div className="flex justify-center mt-6 h-10 items-center">
          <button onClick={loadMore} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            Load more items...
          </button>
        </div>
      )}

      {/* Modal for viewing full details */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.product_title || "Item Details"}
      >
        {selectedItem && (
          <div className="flex flex-col gap-4">
            {selectedItem.image_url && (
              <div className="w-full relative aspect-video bg-surface-hover border border-border rounded-lg overflow-hidden mb-2">
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.product_title}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex justify-between items-center text-sm text-text-secondary border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-disabled" />
                <span className="font-medium">{selectedItem.owner_name}</span>
              </div>
              <p className="font-bold text-lg text-primary">₹{selectedItem.price.toLocaleString('en-IN')}</p>
            </div>

            <p className="text-sm md:text-base text-text-primary whitespace-pre-wrap leading-relaxed">
              {selectedItem.description}
            </p>

            {selectedItem.contact_info && (
              <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-text-primary">
                <Phone className="w-4 h-4 text-text-disabled" />
                <span className="font-medium">Contact: {selectedItem.contact_info}</span>
              </div>
            )}

            {currentUserEmail && selectedItem.owner_email === currentUserEmail && (
              <div className="pt-4 border-t border-border/50 flex items-center gap-2 w-full">
                <button
                  onClick={() => toggleSoldStatus(selectedItem.id, selectedItem.is_sold)}
                  className={`flex-1 font-medium px-4 py-2 rounded-xl transition-all duration-200 text-sm hover:shadow-lg bg-surface-hover hover:bg-surface-hover/80 text-text-primary border border-border`}
                >
                  {selectedItem.is_sold ? "Mark as Active" : "Mark as Sold"}
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedItem.id, selectedItem.image_url ?? null);
                    setSelectedItem(null);
                  }}
                  className="p-2 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                  title="Delete Listing"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
