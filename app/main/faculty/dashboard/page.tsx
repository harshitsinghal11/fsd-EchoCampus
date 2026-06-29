import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Megaphone, BookUser, Camera, ArrowRight, AlertTriangle, LayoutDashboard } from "lucide-react";

import ComplaintList from "@/components/complaints/ComplaintList";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import LostFoundList from "@/components/lost-found/LostFoundList";

export const metadata = {
  title: "Faculty Dashboard",
};

export default function FacultyDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary capitalize flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Faculty Dashboard
          </h1>
          <p className="text-sm md:text-base text-text-muted font-medium">
            Manage announcements and monitor campus activity.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={ROUTES.FACULTY.DIRECTORY}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-hover/80 hover:bg-surface-hover text-text-primary rounded-xl font-medium border border-border/50 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
          >
            Directory
          </Link>
        </div>
      </div>

      {/* --- TOP ROW (Complaints & Announcements) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">

        {/* 1. STUDENT COMPLAINTS */}
        <section className="bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              
              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Student Complaints</h2>
            </div>
            <Link 
              href={ROUTES.FACULTY.COMPLAINTS} 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              View All
              
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <ComplaintList isWidget={true} />
        </section>

        {/* 2. LATEST ANNOUNCEMENTS */}
        <section className="bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              
              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Your Announcements</h2>
            </div>
            <Link 
              href={ROUTES.FACULTY.ANNOUNCEMENTS} 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              Manage
              
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <AnnouncementList isWidget={true} />
        </section>

      </div>

      {/* --- BOTTOM ROW (Lost & Found) --- */}
      <div className="mt-4 md:mt-6 lg:mt-8">
        {/* 3. LOST ITEMS */}
        <section className="bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
             <div className="flex items-center gap-2 md:gap-3">
              
              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Lost Items</h2>
            </div>
            <Link 
              href={ROUTES.FACULTY.LOST_FOUND} 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              View all 
              
            </Link>
          </div>
          {/* Reusable Component (Search hidden) */}
          <LostFoundList showSearch={false} />
        </section>
      </div>
    </div>
  );
}