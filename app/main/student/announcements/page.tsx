import AnnouncementList from "@/components/announcements/AnnouncementList";
import { Megaphone, Search } from "lucide-react";

export default function StudentAnnouncementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. Header (No Lines) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Megaphone className="w-7 h-7 text-blue-400" />
              Announcements
            </h1>
            <p className="text-slate-300 mt-2 text-base">
              Latest updates and notices from the faculty.
            </p>
          </div>
        </div>

        {/* 2. Toolbar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search updates..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 3. The Feed */}
        <div>
          <AnnouncementList />
        </div>

      </div>
    </div>
  );
}