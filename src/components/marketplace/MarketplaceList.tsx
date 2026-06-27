"use client";
import { User, Phone, CheckCircle } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';
import { MarketplaceSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useMarketplace } from "@/hooks/data/useMarketplace";
import { EmptyMarketplace } from "@/components/shared/EmptyStates";

interface MarketListProps {
  currentUserEmail?: string;
  isWidget?: boolean;
}

export default function MarketList({ currentUserEmail, isWidget = false }: MarketListProps) {
  const { items, isLoading, mutate } = useMarketplace(isWidget);

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
    <MotionList className={`grid gap-4 md:gap-6 items-start ${
  isWidget 
    ? "grid-cols-1 sm:grid-cols-2"  
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
}`}>
      {items.map((item) => (
        <MotionItem
          key={item.id}
          className={`relative overflow-hidden rounded-2xl p-5 md:p-6 border transition-all duration-300 ${
            item.is_sold 
              ? "bg-surface border-border opacity-75 grayscale-30" 
              : "bg-surface backdrop-blur-xl border-border shadow-xl hover:bg-surface-hover hover:border-primary/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-surface-hover/40 group"
          }`}
        >
          <div className="flex justify-between items-start gap-3">
            <h2 className={`font-semibold text-lg md:text-xl line-clamp-1 ${item.is_sold ? 'text-text-muted' : 'text-text-primary group-hover:text-primary-light transition-colors'}`}>
              {item.product_title}
            </h2>
            
            {item.is_sold ? (
              <span className="shrink-0 inline-flex items-center gap-1 bg-surface-hover/80 text-text-muted border border-border text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" />
                Sold
              </span>
            ) : (
              <span className="shrink-0 bg-success/10 text-primary border border-primary/30 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Active
              </span>
            )}
          </div>

          <p className={`font-bold text-2xl mt-3 ${item.is_sold ? 'text-text-disabled' : 'text-primary'}`}>
            ₹{item.price}
          </p>
          
          <p className="text-text-muted mt-2 text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          
          <div className="mt-5 pt-4 border-t border-border text-xs md:text-sm text-text-secondary space-y-2.5 flex flex-col justify-end grow">
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

          {!item.is_sold && currentUserEmail && item.owner_email === currentUserEmail && (
            <button
              onClick={() => markSold(item.id)}
              className="mt-5 w-full bg-primary/10 hover:bg-primary/10 text-primary border border-primary/30 font-medium px-4 py-2.5 rounded-xl transition-all duration-200 text-sm hover:shadow-lg hover:shadow-primary/20 "
            >
              Mark as Sold
            </button>
          )}
        </MotionItem>
      ))}
    </MotionList>
  );
}
