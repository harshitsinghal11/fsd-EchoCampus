"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BellRing, BookUser, ShieldAlert, User } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function BottomNavFaculty() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: ROUTES.FACULTY.DASHBOARD, icon: Home },
    { name: "Announcement", href: ROUTES.FACULTY.ANNOUNCEMENTS, icon: BellRing },
    { name: "Directory", href: ROUTES.FACULTY.DIRECTORY, icon: BookUser },
    { name: "Lost/Found", href: ROUTES.FACULTY.LOST_FOUND, icon: ShieldAlert },
    { name: "Profile", href: ROUTES.FACULTY.PROFILE, icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#18181b] border-t border-border pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.4)]">
      <nav className="flex items-center justify-between h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-primary" : "text-text-disabled hover:text-text-secondary"
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-primary/10" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
