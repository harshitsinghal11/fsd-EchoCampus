"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Phone, Calendar, Search, Camera, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { LostFoundSkeleton } from "@/components/shared/Skeletons";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";


interface LostFoundListProps {
  refreshTrigger?: number;
  showSearch?: boolean; // If false, renders as a compact "Widget" for dashboards
}
interface LostFoundItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location_found: string;
  contact_info: string;
  image_url: string | null;
  created_at: string;
}
export default function LostFoundList({ 
  refreshTrigger, 
  showSearch = true 
}: LostFoundListProps) {
  
const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
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
    async function fetchItems() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      let query = supabase
        .from("lost_found")
        .select("*")
        .order("created_at", { ascending: false });

      // In Widget mode (Dashboard), limit to top 3
      if (!showSearch) {
        query = query.limit(3);
      }

      const { data, error } = await query;
      if (!error) setItems(data || []);
      setLoading(false);
    }
    fetchItems();
  }, [refreshTrigger, internalRefresh, showSearch]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Has this item been returned? This post will be deleted.");
    if (!confirm) return;

    const { error } = await supabase.from("lost_found").delete().eq("id", id);
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success("Item removed");
      setInternalRefresh(prev => prev + 1);
    }
  };

  return (
    <div className={`space-y-6 ${!showSearch ? 'h-full flex flex-col' : ''}`}>
      
      {/* --- SEARCH BAR (Only if showSearch is true) --- */}
      {showSearch && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lost items..."
            aria-label="Search lost and found items"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 shadow-lg transition-all hover:bg-slate-900/80"
          />
        </div>
      )}

      {/* --- LOADING STATE --- */}
      {loading && (
        <LostFoundSkeleton isWidget={!showSearch} />
      )}

      {/* --- EMPTY STATE (no data) --- */}
      {!loading && items.length === 0 && (
        <div className={`flex flex-col w-full items-center justify-center text-center ${showSearch ? "py-20" : "py-10"} bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50 text-slate-500`}>
          <Camera className="w-12 h-12 mb-3 opacity-30 text-teal-500" />
          <p className="font-medium text-sm text-slate-400">No items found.</p>
          {showSearch && <p className="text-xs text-slate-500 mt-1">Be the first to report a lost or found item.</p>}
        </div>
      )}

      {/* --- NO SEARCH MATCHES --- */}
      {!loading && showSearch && items.length > 0 && displayItems.length === 0 && (
        <div className="flex flex-col w-full items-center justify-center text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50 text-slate-500">
          <Search className="w-12 h-12 mb-3 opacity-30 text-teal-500" />
          <p className="font-medium text-sm text-slate-400">No matching items.</p>
          <p className="text-xs text-slate-500 mt-1">Try different keywords or clear the search box.</p>
        </div>
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
                ? 'bg-slate-900/40 hover:bg-slate-800/80 rounded-xl p-3 flex items-center gap-3 border border-transparent hover:border-slate-700/50 cursor-pointer' 
                : 'bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row gap-5 md:gap-6 border border-slate-700/50 shadow-xl hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-900/10'
              }
            `}
          >
            
            {/* 1. IMAGE THUMBNAIL */}
            <div className={`
              bg-slate-900 shrink-0 overflow-hidden border border-slate-700/50 flex items-center justify-center relative
              ${!showSearch ? 'rounded-lg w-16 h-16' : 'rounded-2xl w-full sm:w-40 md:w-48 h-48 sm:h-auto'}
            `}>
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt="Item"
                  fill
                  unoptimized
                  sizes={!showSearch ? "64px" : "(max-width: 768px) 100vw, 192px"}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Camera className={`text-slate-600 ${!showSearch ? 'w-6 h-6' : 'w-10 h-10'}`} />
              )}
            </div>

            {/* 2. CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
              
              {/* Header: Title + Date */}
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <h3 className={`font-bold truncate group-hover:text-teal-300 transition-colors ${!showSearch ? 'text-sm text-slate-200' : 'text-lg md:text-xl text-white line-clamp-1'}`}>
                  {item.title}
                </h3>
                
                {/* Date Badge */}
                <span className={`
                  shrink-0 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5
                  ${!showSearch 
                    ? 'text-slate-500' 
                    : 'bg-slate-900/50 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700/50'
                  }
                `}>
                  <Calendar className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Location (Widget Only) */}
              {!showSearch && (
                 <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-500/70" /> 
                    <span className="truncate">{item.location_found}</span>
                 </div>
              )}

              {/* Full Details (Full Page Only) */}
              {showSearch && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/50 text-slate-300 border border-slate-700/50">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" /> 
                      {item.location_found}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                      <Phone className="w-3.5 h-3.5" /> 
                      {item.contact_info}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                    {item.description || "No additional description."}
                  </p>

                  {/* Action Footer */}
                  {currentUserId === item.user_id && (
                    <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-end">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all active:scale-95 group/btn"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" /> 
                        Mark as Found / Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Widget Mode: Chevron for "Go" indication */}
            {!showSearch && (
              <ArrowRight className="shrink-0 w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all mr-1" />
            )}

          </MotionItem>
        ))}
      </MotionList>
      )}
    </div>
  );
}
