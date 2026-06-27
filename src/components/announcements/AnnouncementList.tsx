"use client";
import { User, ExternalLink } from "lucide-react";
import { MotionList } from "@/components/shared/MotionList";
import { MotionItem } from "@/components/shared/MotionItem";
import { useAnnouncements } from "@/hooks/data/useAnnouncements";
import { EmptyAnnouncements } from "@/components/shared/EmptyStates";

interface AnnouncementListProps {
  isWidget?: boolean;
}

export default function AnnouncementList({ isWidget = false }: AnnouncementListProps) {
  const { items, isLoading } = useAnnouncements(isWidget);

  if (isLoading) {
    return (
      <div className={`flex flex-col w-full ${isWidget ? "py-10" : "py-20"}`}>
        <p className="text-center text-text-disabled animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <MotionList className="space-y-4 pr-2 custom-scrollbar h-full overflow-y-auto w-full">
      {items.length === 0 && <EmptyAnnouncements isWidget={isWidget} />}

      {items.map((item) => (
        <MotionItem
          key={item.id}
          className={`border w-full flex flex-col ${isWidget
            ? "bg-surface-hover/60 p-4 rounded-xl border-border hover:bg-surface-hover"
            : "relative overflow-hidden bg-surface backdrop-blur-xl p-6 md:p-8 rounded-2xl border-border hover:bg-surface-hover hover:shadow-2xl hover:shadow-primary/20 group shadow-xl"
            }`}
        >
          <div className="flex flex-col gap-1 w-full">
            <h4 className={`font-bold text-text-primary group-hover:text-primary transition-colors ${isWidget ? "text-sm line-clamp-1" : "text-lg md:text-xl mb-1"}`}>
              {item.title}
            </h4>

            <p className={`text-text-muted ${isWidget ? "text-xs line-clamp-2 mt-1" : "text-sm md:text-base leading-relaxed line-clamp-3"}`}>
              {item.content}
            </p>

            {item.link && (
              <div className={`flex ${isWidget ? "mt-2" : "mt-4"}`}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary transition-colors ${isWidget ? "text-[10px] md:text-xs" : "text-xs md:text-sm bg-primary/10 px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/10"
                    }`}
                >
                  <ExternalLink className={isWidget ? "w-3 h-3" : "w-4 h-4"} />
                  {isWidget ? "Open Link" : "View Attachment / Link"}
                </a>
              </div>
            )}

            {!isWidget && (
              <div className="mt-5 pt-4 border-t border-border text-xs md:text-sm text-text-secondary space-y-2.5 flex flex-col justify-end grow">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-disabled shrink-0" />
                  <span className="truncate font-medium">{item.users?.full_name || "Faculty"}</span>
                </div>
              </div>
            )}
          </div>
        </MotionItem>
      ))}
    </MotionList>
  );
}
