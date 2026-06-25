"use client";
import { useState } from "react";
import LostFoundForm from "@/components/shared/LostFound/LostFoundForm";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";
import { Search } from "lucide-react";

export default function LostFoundPage() {
  const [refreshKey, setRefreshKey] = useState(0);

 return (
    <div className="min-h-[100dvh] p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-slate-950 text-slate-100">
      
      {/* Page Title */}
      <div className="flex flex-col gap-1 md:gap-2">
         <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Search className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
            Lost & Found
         </h1>
         <p className="text-sm md:text-base text-slate-400 font-medium">Report and find lost items across the campus.</p>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mx-auto">
        
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