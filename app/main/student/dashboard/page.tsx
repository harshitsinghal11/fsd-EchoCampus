import Link from "next/link";
import { Megaphone, ShoppingBag, MessageSquare, AlertTriangle, Camera, ArrowRight, BookUser } from "lucide-react";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import MarketplaceList from "@/components/marketplace/MarketplaceList";
import ComplaintList from "@/components/complaints/ComplaintList";
import LostFoundList from "@/components/shared/LostFound/LostFoundList";

export const metadata = {
  title: "Dashboard",
};
export default function StudentDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 mx-auto space-y-6 md:space-y-8 text-slate-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize">
            Hey! Welcome To EchoCampus
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium">
            Here&apos;s what&apos;s happening around campus today.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/main/student/chat"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-600/50 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Global Chat
          </Link>
          <Link
            href="/main/student/directory"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-600/50 hover:border-teal-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
          >
            <BookUser className="w-4 h-4 text-teal-400" />
            Directory
          </Link>
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

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

        {/* 3. RECENT COMPLAINTS (Right 1/3) */}
        <section className="bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-2.5 bg-orange-500/20 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Recent Complaints</h2>
            </div>
            <Link
              href="/main/student/complaint"
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
            >
              View All
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ComplaintList isWidget={true} />
        </section>

        {/* 4. LOST & FOUND SECTION (Full Width at Bottom) */}
        <section className="lg:col-span-3 bg-slate-800/40 backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-slate-700/50 shadow-xl">
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