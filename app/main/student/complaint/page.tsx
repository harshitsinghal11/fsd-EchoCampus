"use client";

import ComplaintForm from "@/components/complaints/complaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";
import { MessageSquare } from "lucide-react";

export default function Page() {
  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-slate-950 text-slate-100">
      <header className="flex flex-col gap-1 md:gap-2 mb-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
          Campus Complaints
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          Voice your concerns and track issue resolution.
        </p>
      </header>
      <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
        <ComplaintList />
        <ComplaintForm />
      </div>
    </div>
  );
}
