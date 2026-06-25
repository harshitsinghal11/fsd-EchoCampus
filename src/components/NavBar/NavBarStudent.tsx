"use client";
import { Home, User, MessageSquare, Mic, BookUser, ShieldAlert, Store, BellRing } from "lucide-react";
import BaseNavBar, { NavLink } from "@/components/shared/BaseNavBar";

export default function Navbar() {
  const navLinks: NavLink[] = [
    { name: "Dashboard", href: "/main/student/dashboard", icon: Home },
    { name: "Announcements", href: "/main/student/announcements", icon: BellRing },
    { name: "Anonymous Chats", href: "/main/student/chat", icon: MessageSquare },
    { name: "Complaints", href: "/main/student/complaint", icon: Mic },
    { name: "Directory", href: "/main/student/directory", icon: BookUser },
    { name: "Lost & Found", href: "/main/student/lost-found", icon: ShieldAlert },
    { name: "Marketplace", href: "/main/student/marketplace", icon: Store },
    { name: "Profile", href: "/main/student/profile", icon: User },
  ];

  return <BaseNavBar navLinks={navLinks} />;
}