"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, BookUser, Store, MoreHorizontal, BellRing, Mic, ShieldAlert, User, Bot } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function AppBottomNav({ role }: { role: "student" | "faculty" | "admin" }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isFacultyLike = role === "faculty" || role === "admin";

  const navItems = isFacultyLike
    ? [
        { name: "Home", href: ROUTES.FACULTY.DASHBOARD, icon: Home },
        { name: "Complaints", href: "/main/faculty/complaints", icon: MessageSquare },
        { name: "Alerts", href: ROUTES.FACULTY.ANNOUNCEMENTS, icon: BellRing },
        { name: "Directory", href: ROUTES.FACULTY.DIRECTORY, icon: BookUser },
        { name: "Lost/Found", href: ROUTES.FACULTY.LOST_FOUND, icon: ShieldAlert },
        { name: "Profile", href: ROUTES.FACULTY.PROFILE, icon: User },
      ]
    : [
        { name: "Home", href: ROUTES.STUDENT.DASHBOARD, icon: Home },
        { name: "Chat", href: ROUTES.STUDENT.CHAT, icon: MessageSquare },
        { name: "Directory", href: ROUTES.STUDENT.DIRECTORY, icon: BookUser },
        { name: "Market", href: ROUTES.STUDENT.MARKETPLACE, icon: Store },
      ];

  const moreItems = isFacultyLike 
    ? [] // Faculty doesn't use the 'more' drawer right now
    : [
        { name: "Announcements", href: ROUTES.STUDENT.ANNOUNCEMENTS, icon: BellRing },
        { name: "Complaints", href: ROUTES.STUDENT.COMPLAINTS, icon: Mic },
        { name: "Lost & Found", href: ROUTES.STUDENT.LOST_FOUND, icon: ShieldAlert },
        { name: "Profile", href: ROUTES.STUDENT.PROFILE, icon: User },
      ];

  return (
    <>
      {/* Bottom Sheet Overlay (Only for student view) */}
      {!isFacultyLike && (
        <div
          className={`md:hidden fixed inset-0 z-[60] flex flex-col justify-end transition-all duration-300 ${showMore ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
            }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 pointer-events-auto ${showMore ? "opacity-100" : "opacity-0"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMore(false);
            }}
          />

          {/* Sheet */}
          <div className={`relative bg-[#18181b] border-t border-border rounded-t-2xl shadow-sm transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] ${showMore ? "translate-y-0" : "translate-y-full"
            }`}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-border rounded-full" />
            </div>

            <div className="px-6 pb-6 pt-2">
              <h3 className="text-lg font-bold text-text-primary mb-4">More Features</h3>

              <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                {moreItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center gap-2 group w-full"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-hover text-text-secondary hover:text-text-primary"
                        }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-medium text-center ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#18181b] border-t border-border pb-[env(safe-area-inset-bottom)] z-50"
        style={{ paddingRight: 'var(--scrollbar-width, 0px)' }}
      >
        <nav className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-primary" : "text-text-disabled hover:text-text-secondary"
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/10" : ""}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {!isFacultyLike && (
            <div className="w-full h-full">
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${showMore ? "text-primary" : "text-text-disabled hover:text-text-secondary"
                  }`}
              >
                <MoreHorizontal className={`w-6 h-6 ${showMore ? "fill-primary/10" : ""}`} />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
