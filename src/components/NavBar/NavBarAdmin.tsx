"use client";
import { Home, User, BookUser, ShieldAlert, BellRing, MessageSquare } from "lucide-react";
import BaseNavBar, { NavLink } from "@/components/shared/BaseNavBar";
import { ROUTES } from "@/lib/routes";

export default function Navbar() {
  const navLinks: NavLink[] = [
    { name: "Dashboard", href: ROUTES.FACULTY.DASHBOARD, icon: Home },
    { name: "Complaints", href: "/main/faculty/complaints", icon: MessageSquare },
    { name: "Announcements", href: ROUTES.FACULTY.ANNOUNCEMENTS, icon: BellRing },
    { name: "Directory", href: ROUTES.FACULTY.DIRECTORY, icon: BookUser },
    { name: "Lost & Found", href: ROUTES.FACULTY.LOST_FOUND, icon: ShieldAlert },
    { name: "Profile", href: ROUTES.FACULTY.PROFILE, icon: User },
  ];

  return <BaseNavBar navLinks={navLinks} />;
}
