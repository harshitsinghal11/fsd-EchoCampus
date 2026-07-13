"use client";
import { Home, User, BookUser, ShieldAlert, BellRing, MessageSquare, Mic, Store } from "lucide-react";
import BaseNavBar, { NavLink } from "@/components/shared/BaseNavBar";
import { ROUTES } from "@/lib/routes";

export default function AppNavbar({ role }: { role: "student" | "faculty" | "admin" }) {
  const isFacultyLike = role === "faculty" || role === "admin";

  const navLinks: NavLink[] = isFacultyLike
    ? [
        { name: "Dashboard", href: ROUTES.FACULTY.DASHBOARD, icon: Home },
        { name: "Complaints", href: "/main/faculty/complaints", icon: MessageSquare },
        { name: "Announcements", href: ROUTES.FACULTY.ANNOUNCEMENTS, icon: BellRing },
        { name: "Directory", href: ROUTES.FACULTY.DIRECTORY, icon: BookUser },
        { name: "Lost & Found", href: ROUTES.FACULTY.LOST_FOUND, icon: ShieldAlert },
        { name: "Profile", href: ROUTES.FACULTY.PROFILE, icon: User },
      ]
    : [
        { name: "Dashboard", href: ROUTES.STUDENT.DASHBOARD, icon: Home },
        { name: "Announcements", href: ROUTES.STUDENT.ANNOUNCEMENTS, icon: BellRing },
        { name: "Anonymous Chats", href: ROUTES.STUDENT.CHAT, icon: MessageSquare },
        { name: "Complaints", href: ROUTES.STUDENT.COMPLAINTS, icon: Mic },
        { name: "Directory", href: ROUTES.STUDENT.DIRECTORY, icon: BookUser },
        { name: "Lost & Found", href: ROUTES.STUDENT.LOST_FOUND, icon: ShieldAlert },
        { name: "Marketplace", href: ROUTES.STUDENT.MARKETPLACE, icon: Store },
        { name: "Profile", href: ROUTES.STUDENT.PROFILE, icon: User },
      ];

  return <BaseNavBar navLinks={navLinks} />;
}
