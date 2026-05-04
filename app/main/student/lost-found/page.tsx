"use client";
import { useState } from "react";
import LostFoundForm from "@/components/shared/LostFound/LostFoundForm";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";
import { Camera } from "lucide-react";

export default function LostFoundPage() {
  // This key forces the list to reload when a new item is added
  const [refreshKey, setRefreshKey] = useState(0);

 return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-slate-900 via-blue-950 to-black text-slate-100">
      
      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Feed (Bottom on Mobile, Left on Desktop) */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Note: Ensure showSearch={true} is passed if required by your list logic! */}
          <LostFoundList refreshTrigger={refreshKey} showSearch={true} />
        </div>
        
        {/* RIGHT COLUMN: Report Form (Top on Mobile, Right on Desktop) */}
        <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
          {/* top-28 ensures it clears your frosted Navigation Bar */}
          <div className="lg:sticky lg:top-28">
            {/* The form is already styled as a glass card, so we just drop it in directly! */}
            <LostFoundForm onSuccess={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div> 

      </div>
    </div>
  );
}