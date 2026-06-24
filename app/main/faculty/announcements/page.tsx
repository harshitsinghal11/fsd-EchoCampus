import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import { Megaphone, Activity, Radio } from "lucide-react";

export default function AdminAnnouncementsPage() {
   return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">

         {/* Page Title */}
         <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">Announcement Center</h1>
            <p className="text-slate-400 mt-1 font-medium text-sm md:text-base">Manage campus-wide broadcasts and updates.</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* LEFT COLUMN: Live Feed (66% Width) */}
            <div className="lg:col-span-2">
               <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-3xl min-h-[600px] flex flex-col">

                  {/* Header */}
                  <div className="p-5 md:p-6 lg:p-8 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                           <Radio className="w-5 h-5 text-blue-400" />
                           Live Broadcasts
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">History of posted announcements</p>
                     </div>
                     <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/30">
                        Live View
                     </span>
                  </div>

                  {/* Feed Content */}
                  <div className="p-5 md:p-6 lg:p-8 flex-1">
                     <AnnouncementList />
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: The Form Widget (33% Width) */}
            <div className="lg:col-span-1">
               <div className="sticky top-24">
                  <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-3xl overflow-hidden">

                     {/* The Blue Header Block (As per image) */}
                     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                           <Megaphone className="w-5 h-5" />
                           Post Update
                        </h2>
                        <p className="text-blue-100 text-xs mt-2 leading-relaxed font-medium">
                           This message will be instantly visible to all students.
                        </p>
                     </div>

                     {/* The Form */}
                     <div className="p-6 md:p-8">
                        <AnnouncementForm />
                     </div>
                  </div>

                  {/* Optional Helper Card */}
                  <div className="mt-6 bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20 text-sm text-blue-400 flex gap-3 shadow-sm">
                     <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                     <p className="text-xs md:text-sm leading-relaxed font-medium">
                        <strong>Pro Tip:</strong> Keep titles short and concise. Check the &quot;Live Broadcasts&quot; list on the left to confirm your post appears correctly.
                     </p>
                  </div>

               </div>
            </div>

         </div>
      </div>
   );
}