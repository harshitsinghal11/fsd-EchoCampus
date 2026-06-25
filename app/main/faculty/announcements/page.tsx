import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import { AnnouncementSkeleton } from "@/components/shared/Skeletons";
import { Megaphone, Activity, Radio } from "lucide-react";
import { Suspense } from "react";

export default function AdminAnnouncementsPage() {
   return (
      <div className="min-h-[100dvh] text-slate-100">
         <div className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">

            {/* Page Title */}
            <div className="flex flex-col gap-1 md:gap-2">
               <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
                  Announcement Center
               </h1>
               <p className="text-sm md:text-base text-slate-400 font-medium">Manage campus-wide broadcasts and updates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

               {/* LEFT COLUMN: Live Feed (66% Width) */}
               <div className="lg:col-span-2">
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-3xl min-h-[600px] flex flex-col">

                     {/* Header */}
                     <div className="p-5 md:p-6 lg:p-8 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                           <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                              <Radio className="w-5 h-5 text-teal-400" />
                              Live Broadcasts
                           </h2>
                           <p className="text-sm text-slate-400 mt-1">History of posted announcements</p>
                        </div>
                        <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-500/20">
                           Live View
                        </span>
                     </div>

                     {/* Feed Content */}
                     <div className="p-5 md:p-6 lg:p-8 flex-1">
                        <Suspense fallback={<AnnouncementSkeleton />}>
                           <AnnouncementList />
                        </Suspense>
                     </div>
                  </div>
               </div>

               {/* RIGHT COLUMN: The Form Widget (33% Width) */}
               <div className="lg:col-span-1">
                  <div className="sticky top-24">
                     <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-3xl overflow-hidden">

                        {/* The Header Block */}
                        <div className="bg-slate-900/80 border-b border-slate-700/50 p-6 md:p-8 text-white">
                           <h2 className="text-xl font-bold flex items-center gap-2">
                              <Megaphone className="w-5 h-5 text-teal-400" />
                              Post Update
                           </h2>
                           <p className="text-slate-400 text-xs mt-2 leading-relaxed font-medium">
                              This message will be instantly visible to all students.
                           </p>
                        </div>

                        {/* The Form */}
                        <div className="p-6 md:p-8">
                           <AnnouncementForm />
                        </div>
                     </div>

                  </div>
               </div>

            </div>
         </div>
      </div>
   );
}