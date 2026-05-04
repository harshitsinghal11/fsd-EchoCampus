import Link from "next/link";
import { Megaphone, ShoppingBag, MessageSquare, AlertTriangle, Camera, ArrowRight } from "lucide-react";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import MarketplaceList from "@/components/marketplace/MarketplaceList";
import ComplaintList from "@/components/complaints/ComplaintList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export const metadata = {
title: "Dashboard",
};
export default function StudentDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 mx-auto space-y-6 md:space-y-8 bg-linear-to-br from-slate-900 via-blue-950 to-black text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 md:gap-2 pt-2 md:pt-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize">
          Hey! Welcome To EchoCampus
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          Here's what's happening around campus today.
        </p>
      </div>

      {/* --- GRID LAYOUT --- */}
      {/* gap-4 on mobile, gap-6 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3">

        {/* 1. LATEST ANNOUNCEMENTS (Full Width) */}
        <section className="lg:col-span-3 bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-blue-500/20 rounded-lg md:rounded-xl">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Latest Announcements</h2>
            </div>
            <Link 
              href="/main/student/announcements" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <AnnouncementList isWidget={true} />
        </section>

        {/* 2. NEWEST LISTINGS (Left 2/3) */}
        <section className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-purple-500/20 rounded-lg md:rounded-xl">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Newest Listings</h2>
            </div>
            <Link 
              href="/main/student/marketplace" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Browse Market
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <MarketplaceList isWidget={true} />
        </section>

        {/* 3. RIGHT COLUMN (Complaints + 2x2 Actions) */}
        <div className="space-y-4 md:space-y-6 flex flex-col">

          {/* A. Top Complaints */}
          <section className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 border border-slate-700/50 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6">
              <div className="p-2 md:p-2.5 bg-orange-500/20 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Recent Complaints</h2>
            </div>
            <ComplaintList isWidget={true} />
          </section>

          {/* B. Quick Actions (Static Links) */}
          <section className="bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Link href="/main/student/marketplace" className="flex flex-col items-center justify-center p-3 md:p-4 bg-slate-700/30 rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-700/60 hover:shadow-lg transition-all border border-slate-600/30 group">
                <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-purple-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Sell Item</span>
              </Link>

              <Link href="/main/student/complaint" className="flex flex-col items-center justify-center p-3 md:p-4 bg-slate-700/30 rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-700/60 hover:shadow-lg transition-all border border-slate-600/30 group">
                <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-orange-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Complaint</span>
              </Link>

              <Link href="/main/student/chat" className="flex flex-col items-center justify-center p-3 md:p-4 bg-slate-700/30 rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-700/60 hover:shadow-lg transition-all border border-slate-600/30 group">
                <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-blue-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Global Chat</span>
              </Link>

              <Link href="/main/student/lost-found" className="flex flex-col items-center justify-center p-3 md:p-4 bg-slate-700/30 rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-700/60 hover:shadow-lg transition-all border border-slate-600/30 group">
                <Camera className="w-6 h-6 md:w-7 md:h-7 text-teal-400 mb-2 md:mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300" />
                <span className="text-xs md:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Lost & Found</span>
              </Link>
            </div>
          </section>

        </div>

        {/* 4. LOST & FOUND SECTION (Full Width at Bottom) */}
        <section className="lg:col-span-3 bg-slate-800/40 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-teal-500/20 rounded-lg md:rounded-xl">
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Recent Lost & Found</h2>
            </div>
            <Link 
              href="/main/student/lost-found" 
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <LostFoundList showSearch={false} />
        </section>

      </div>
    </div>
  );
}