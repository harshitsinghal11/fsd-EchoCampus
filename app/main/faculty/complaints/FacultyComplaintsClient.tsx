"use client";

import { useState } from "react";
import ComplaintList from "@/components/complaints/ComplaintList";
import { SearchBar } from "@/components/shared/SearchBar";

export default function FacultyComplaintsClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");

  return (
    <>
      {/* --- Search & Filters (Full Width) --- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search complaints..."
            className="w-full max-w-md"
          />
        </div>
        <div className="shrink-0 flex items-center bg-surface-hover/50 p-1 rounded-xl border border-border">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
            <button
              key={level}
              onClick={() => setUrgencyFilter(level)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                urgencyFilter === level 
                  ? 'bg-surface shadow-sm text-primary border border-border/50' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[600px]">
        <div className="absolute inset-0 flex flex-col">
          <ComplaintList searchTerm={searchTerm} urgencyFilter={urgencyFilter} />
        </div>
      </div>
    </>
  );
}
