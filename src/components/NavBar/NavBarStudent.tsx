"use client";
import { Home, User, MessageSquare, Mic, BookUser, ShieldAlert, Store, BellRing } from "lucide-react";
import BaseNavBar, { NavLink } from "@/components/shared/BaseNavBar";
import { ROUTES } from "@/lib/routes";

export default function Navbar() {
  const navLinks: NavLink[] = [
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