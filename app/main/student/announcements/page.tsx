import AnnouncementList from "@/components/announcements/AnnouncementList";
import { AnnouncementSkeleton } from "@/components/shared/Skeletons";
import { Megaphone, Search } from "lucide-react";
import { Suspense } from "react";

export default function StudentAnnouncementsPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto space-y-6">

        {/* 1. Header (No Lines) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="flex flex-col gap-1 md:gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
              Announcements
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-medium">
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
          <Suspense fallback={<AnnouncementSkeleton />}>
            <AnnouncementList />
          </Suspense>
        </div>

      </div>
    </div>
  );
}