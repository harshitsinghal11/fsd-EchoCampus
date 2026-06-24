import Link from "next/link";
import { Megaphone, BookUser, Camera, ArrowRight, AlertTriangle } from "lucide-react";

import ComplaintList from "@/components/complaints/ComplaintList";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export const metadata = {
  title: "Faculty Dashboard",
};

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 mx-auto space-y-6 md:space-y-8 bg-linear-to-br from-slate-900 via-blue-950 to-black text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 md:gap-2 pt-2 md:pt-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize">
          Faculty Dashboard
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          Manage announcements and monitor campus activity.
        </p>
      </div>

      {/* --- TOP ROW (Complaints & Announcements) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* 1. STUDENT COMPLAINTS */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-orange-500/20 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Student Complaints</h2>
            </div>
          </div>
          {/* Reusable Component in Widget Mode */}
          <ComplaintList isWidget={true} />
        </section>

        {/* 2. LATEST ANNOUNCEMENTS */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-blue-500/20 rounded-lg md:rounded-xl">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Your Announcements</h2>
            </div>
            <Link 
              href="/main/faculty/announcements" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {/* Reusable Component in Widget Mode */}
          <AnnouncementList isWidget={true} />
        </section>

      </div>

      {/* --- BOTTOM ROW (Lost & Found + Quick Actions) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

        {/* 3. LOST ITEMS */}
        <section className="lg:col-span-3 bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col h-[350px]">
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

        {/* 4. QUICKLY NAVIGATE (Static Actions) */}
        <section className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 border border-slate-700/50 shadow-xl h-[350px] flex flex-col">
          <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-5 shrink-0">Quick Actions</h3>
          
          <div className="flex-1 flex flex-col gap-4">
            {/* Post Announcement */}
            <Link 
              href="/main/faculty/announcements"
              className="flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/60 shadow-sm hover:shadow-lg transition-all rounded-xl border border-slate-600/30 group"
            >
              <span className="font-bold text-slate-200">Post an Announcement</span>
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Megaphone className="w-5 h-5" />
              </div>
            </Link>

            {/* Icons Row */}
            <div className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/30 flex-1 flex flex-col justify-center">
               <h3 className="text-sm font-bold text-slate-400 mb-4 text-center">Navigate</h3>
               <div className="flex gap-4 justify-around">
                 <Link href="/main/faculty/directory" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-700/50 group-hover:border-purple-400/50 transition-all">
                      <BookUser className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Directory</span>
                 </Link>
                 <Link href="/main/faculty/lost-found" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-700/50 group-hover:border-teal-400/50 transition-all">
                      <Camera className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Lost Items</span>
                 </Link>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}