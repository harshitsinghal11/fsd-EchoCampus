import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import { AnnouncementSkeleton } from "@/components/shared/Skeletons";
import { Megaphone } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Announcements",
};

export default function AdminAnnouncementsPage() {
   return (
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">

         {/* Page Title */}
         <div className="flex flex-col gap-1 md:gap-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
               <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-primary" />
               Announcement Center
            </h1>
            <p className="text-sm md:text-base text-text-muted font-medium">Manage campus-wide broadcasts and updates.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mx-auto">

            {/* LEFT COLUMN: Live Feed (66% Width) */}
            <div className="lg:col-span-2">
               <Suspense fallback={<AnnouncementSkeleton />}>
                  <AnnouncementList />
               </Suspense>
            </div>

            {/* RIGHT COLUMN: The Form Widget (33% Width) */}
            <div className="lg:col-span-1 mb-6 lg:mb-0">
               <div className="lg:sticky lg:top-28">
                  <AnnouncementForm />
               </div>
            </div>

         </div>
      </div>
   );
}