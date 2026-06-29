"use client";
import { useState, useMemo } from 'react';
import Image from "next/image";
import { User, Phone, CheckCircle } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';
import { MarketplaceSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useMarketplace } from "@/hooks/data/useMarketplace";
import { EmptyMarketplace, EmptySearch } from "@/components/shared/EmptyStates";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

interface MarketListProps {
  currentUserEmail?: string;
  isWidget?: boolean;
}

export default function MarketList({ currentUserEmail, isWidget = false }: MarketListProps) {
  const [limit, setLimit] = useState(10);
  const { items, isLoading, mutate } = useMarketplace(isWidget, isWidget ? undefined : limit);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  async function markSold(id: string) {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;

    try {
      const { error } = await supabase
        .from("marketplace")
        .update({ is_sold: true })
        .eq("id", id);

      if (!error) {
        toast.success("Item marked as sold");
        mutate();
      } else {
        toast.error("Failed to update status: " + error.message);
      }
    } catch {
      toast.error("Network error.");
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
        <MotionList className={`grid gap-3 sm:gap-4 md:gap-6 items-start ${isWidget
          ? "grid-cols-2 sm:grid-cols-2"
          : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
          }`}>
          {displayItems.map((item) => (
            <MotionItem
              key={item.id}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 border transition-all duration-300 flex flex-col h-full ${item.is_sold
                ? "bg-surface border-border opacity-75 grayscale-30"
                : "bg-surface backdrop-blur-xl border-border shadow-xl hover:bg-surface-hover hover:border-primary/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-surface-hover/40 group"
                }`}
            >
              {/* IMAGE THUMBNAIL */}
              {item.image_url && (
                <div className={`
              bg-surface-hover shrink-0 overflow-hidden border border-border flex items-center justify-center relative mb-3 sm:mb-4
              rounded-lg sm:rounded-xl w-full aspect-[4/3] sm:aspect-video
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
                <h2 className={`font-semibold line-clamp-1 ${isWidget ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} ${item.is_sold ? 'text-text-muted' : 'text-text-primary group-hover:text-primary-light transition-colors'}`}>
                  {item.product_title}
                </h2>

                {item.is_sold ? (
                  <span className="shrink-0 inline-flex items-center gap-1 bg-surface-hover/80 text-text-muted border border-border text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Sold
                  </span>
                ) : (
                  <span className="shrink-0 bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>

              <p className={`font-bold mt-1.5 sm:mt-2 ${isWidget ? 'text-sm sm:text-base' : 'text-base sm:text-lg sm:mt-2'} ${item.is_sold ? 'text-text-disabled' : 'text-primary'}`}>
                ₹{item.price.toLocaleString('en-IN')}
              </p>

              <p className={`text-text-muted mt-1.5 sm:mt-2 leading-relaxed ${isWidget ? 'text-[10px] sm:text-xs line-clamp-2' : 'text-[10px] sm:text-xs md:text-sm line-clamp-2 sm:line-clamp-3'}`}>
                {item.description}
              </p>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-4 border-t border-border/60 text-xs text-text-secondary flex flex-row justify-between items-center gap-1.5 sm:gap-2 grow">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-disabled shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs">{item.owner_name}</span>
                </div>

                {!isWidget && item.contact_info && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-disabled shrink-0" />
                    <span className="text-[10px] sm:text-xs">{item.contact_info}</span>
                  </div>
                )}
              </div>

              {!item.is_sold && currentUserEmail && item.owner_email === currentUserEmail && (
                <button
                  onClick={() => markSold(item.id)}
                  className="mt-3 sm:mt-5 w-full bg-primary/10 hover:bg-primary/10 text-primary border border-primary/30 font-medium px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 text-[11px] sm:text-xs hover:shadow-lg hover:shadow-primary/20 "
                >
                  Mark as Sold
                </button>
              )}
            </MotionItem>
          ))}
        </MotionList>
      )}

      {/* --- LOAD MORE BUTTON --- */}
      {!isWidget && items.length === limit && displayItems.length > 0 && !searchTerm && (
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
