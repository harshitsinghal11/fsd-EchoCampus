import Link from "next/link";
import { Megaphone, BookUser, Camera, ArrowRight, AlertTriangle, LayoutDashboard } from "lucide-react";

import ComplaintList from "@/components/complaints/ComplaintList";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export const metadata = {
  title: "Faculty Dashboard",
};

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 mx-auto space-y-6 md:space-y-8 text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
            Faculty Dashboard
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium">
            Manage announcements and monitor campus activity.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/main/faculty/directory"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-600/50 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
          >
            <BookUser className="w-4 h-4 text-teal-400" />
            Directory
          </Link>
        </div>
      </div>

      {/* --- TOP ROW (Complaints & Announcements) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">

        {/* 1. STUDENT COMPLAINTS */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-orange-500/20 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Student Complaints</h2>
            </div>
            <Link 
              href="/main/faculty/complaints" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <ComplaintList isWidget={true} />
        </section>

        {/* 2. LATEST ANNOUNCEMENTS */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-teal-500/20 rounded-lg md:rounded-xl">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Your Announcements</h2>
            </div>
            <Link 
              href="/main/faculty/announcements" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              Manage
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <AnnouncementList isWidget={true} />
        </section>

      </div>

      {/* --- BOTTOM ROW (Lost & Found) --- */}
      <div className="mt-4 md:mt-6 lg:mt-8">
        {/* 3. LOST ITEMS */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
             <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-teal-500/20 rounded-lg md:rounded-xl">
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Lost Items</h2>
            </div>
            <Link 
              href="/main/faculty/lost-found" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              View all 
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Reusable Component (Search hidden) */}
          <LostFoundList showSearch={false} />
        </section>
      </div>
    </div>
  );
}