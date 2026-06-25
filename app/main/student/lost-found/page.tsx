"use client";
import { useState } from "react";
import LostFoundForm from "@/components/shared/LostFound/LostFoundForm";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export default function LostFoundPage() {
  const [refreshKey, setRefreshKey] = useState(0);

 return (
    <div className="min-h-[100dvh] p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-950 text-slate-100">
      
      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: Feed (Top on Mobile, Left on Desktop) */}
        <div className="lg:col-span-2">
          <LostFoundList refreshTrigger={refreshKey} showSearch={true} />
        </div>
        
        {/* RIGHT COLUMN: Report Form (Bottom on Mobile, Right on Desktop) */}
        <div className="lg:col-span-1 mb-6 lg:mb-0">
          <div className="lg:sticky lg:top-28">
            <LostFoundForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div> 

      </div>
    </div>
  );
}