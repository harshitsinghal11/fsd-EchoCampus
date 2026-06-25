"use client";
import { User, Phone, CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from "react";
import { MarketplaceItem } from "@/types/marketplace"; 
import { supabase } from "@/lib/supabaseClient";
import { toast } from 'sonner';
import { MarketplaceSkeleton } from "@/components/shared/Skeletons";

// 1. Update the Props Interface
interface MarketListProps {
  currentUserEmail?: string; // Made optional
  isWidget?: boolean;        // New prop
}

export default function MarketList({ currentUserEmail, isWidget = false }: MarketListProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("marketplace")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      let fetchedItems = data || [];

      // 2. If used as a widget, only show the top 4 items
      if (isWidget) {
        fetchedItems = fetchedItems.slice(0, 4);
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to load marketplace items", error);
    } finally {
      setLoading(false);
    }
  }, [isWidget]);

  async function markSold(id: string) {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;

    try {
      const { error } = await supabase
        .from("marketplace")
        .update({ is_sold: true })
        .eq("id", id);
      
      if (!error) {
        toast.success("Item marked as sold");
        load(); 
      } else {
        toast.error("Failed to update status: " + error.message);
      }
    } catch {
      toast.error("Network error.");
    }
  }

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('public:marketplace')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading) return <MarketplaceSkeleton isWidget={isWidget} />;

  if (items.length === 0) return <p className="text-gray-500 text-center">No items found.</p>;

  return (
    // Grid adapts based on widget mode vs full page mode
    <div className={`grid gap-4 md:gap-6 items-start ${
  isWidget 
    ? "grid-cols-1 sm:grid-cols-2"  
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`relative overflow-hidden rounded-2xl p-5 md:p-6 border transition-all duration-300 ${
            item.is_sold 
              ? "bg-slate-900/50 border-slate-800 opacity-75 grayscale-[30%]" 
              : "bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-xl hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 group"
          }`}
        >
          {/* Status Badge & Title */}
          <div className="flex justify-between items-start gap-3">
            <h2 className={`font-semibold text-lg md:text-xl line-clamp-1 ${item.is_sold ? 'text-slate-400' : 'text-white group-hover:text-purple-300 transition-colors'}`}>
              {item.product_title}
            </h2>
            
            {/* Themed Badges */}
            {item.is_sold ? (
              <span className="shrink-0 inline-flex items-center gap-1 bg-slate-800/80 text-slate-400 border border-slate-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" />
                Sold
              </span>
            ) : (
              <span className="shrink-0 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Active
              </span>
            )}
          </div>

          {/* Price - Using the Purple Accent from your Dashboard for Marketplace items */}
          <p className={`font-bold text-2xl mt-3 ${item.is_sold ? 'text-slate-500' : 'text-purple-400'}`}>
            ₹{item.price}
          </p>
          
          {/* Description */}
          <p className="text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          
          {/* Footer details (User & Phone) */}
          <div className="mt-5 pt-4 border-t border-slate-700/50 text-xs md:text-sm text-slate-300 space-y-2.5 flex flex-col justify-end flex-grow">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{item.owner_name}</span>
            </div>
            
            {/* Hide phone number on widget to save space */}
            {!isWidget && item.contact_info && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{item.contact_info}</span>
              </div>
            )}
          </div>

          {/* Owner Actions (Glassmorphism Yellow Button) */}
          {!item.is_sold && currentUserEmail && item.owner_email === currentUserEmail && (
            <button
              onClick={() => markSold(item.id)}
              className="mt-5 w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-medium px-4 py-2.5 rounded-xl transition-all duration-200 text-sm hover:shadow-lg hover:shadow-yellow-900/20 active:scale-95"
            >
              Mark as Sold
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
