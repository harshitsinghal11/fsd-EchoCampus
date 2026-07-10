"use client";

import ComplaintForm from "@/components/complaints/complaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/shared/SearchBar";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-background text-text-primary">
      <header className="flex flex-col gap-1 md:gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
          <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Campus Complaints
        </h1>
        <p className="text-sm md:text-base text-text-muted font-medium">
          Voice your concerns and track issue resolution.
        </p>
      </header>

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
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${urgencyFilter === level
                  ? 'bg-surface shadow-sm text-primary border border-border/50'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
            >
              {level === 'ALL' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 min-h-[500px] md:min-h-0">
          <div className="absolute inset-0 flex flex-col">
            <ComplaintList searchTerm={searchTerm} urgencyFilter={urgencyFilter} />
          </div>
        </div>
        <div className="w-full md:max-w-md shrink-0" id="action-form">
          <ComplaintForm />
        </div>
      </div>
    </div>
  );
}
