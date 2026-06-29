import AnnouncementList from "@/components/announcements/AnnouncementList";
import { AnnouncementSkeleton } from "@/components/shared/Skeletons";
import { Megaphone, Search } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Announcements",
};

export default function StudentAnnouncementsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full space-y-6">

        {/* 1. Header (No Lines) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="flex flex-col gap-1 md:gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
              <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              Announcements
            </h1>
            <p className="text-sm md:text-base text-text-muted font-medium">
              Latest updates and notices from the faculty.
            </p>
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