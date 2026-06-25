import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { User, ExternalLink } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  link: string | null;
  created_at: string;
  users?: {
    full_name?: string;
  } | null;
};

interface AnnouncementListProps {
  isWidget?: boolean;
}

export default async function AnnouncementList({ isWidget = false }: AnnouncementListProps) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("announcements")
    .select(`*, users ( full_name )`)
    .order("created_at", { ascending: false });

  if (isWidget) query = query.limit(3);

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching announcements:", error);
  }
  
  const list = (data as Announcement[]) || [];

  return (
    <div className="space-y-3 pr-2 custom-scrollbar h-full overflow-y-auto">
      {list.length === 0 && (
        <div className="text-center py-10 flex items-center justify-center text-slate-500">
          <p>No announcements yet.</p>
        </div>
      )}

      {list.map((item) => (
        <div
          key={item.id}
          className={`transition-all duration-200 border ${
            isWidget
              ? "bg-slate-800/60 p-4 rounded-xl border-slate-700/50 hover:bg-slate-700/50"
              : "bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border-slate-700/50 hover:bg-slate-800/60 shadow-lg"
          }`}
        >
          <div className="flex flex-col gap-1">
            <h4 className={`font-bold text-white ${isWidget ? "text-sm line-clamp-1" : "text-xl md:text-2xl mb-2"}`}>{item.title}</h4>

            <p className={`text-slate-400 ${isWidget ? "text-xs line-clamp-2 mt-1" : "text-sm md:text-base leading-relaxed whitespace-pre-wrap"}`}>
              {item.content}
            </p>

            {item.link && (
              <div className={`flex ${isWidget ? "mt-2" : "mt-4"}`}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors ${
                    isWidget ? "text-[10px] md:text-xs" : "text-xs md:text-sm bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20"
                  }`}
                >
                  <ExternalLink className={isWidget ? "w-3 h-3" : "w-4 h-4"} />
                  {isWidget ? "Open Link" : "View Attachment / Link"}
                </a>
              </div>
            )}

            {!isWidget && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700/50 text-xs md:text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-300">{item.users?.full_name || "Faculty"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
