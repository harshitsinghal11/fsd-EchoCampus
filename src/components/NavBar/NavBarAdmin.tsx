"use client";
import { Home, User, BookUser, ShieldAlert, BellRing } from "lucide-react";
import BaseNavBar, { NavLink } from "@/components/shared/BaseNavBar";

export default function Navbar() {
  const navLinks: NavLink[] = [
    { name: "Dashboard", href: "/main/faculty/dashboard", icon: Home },
    { name: "Announcements", href: "/main/faculty/announcements", icon: BellRing },
    { name: "Directory", href: "/main/faculty/directory", icon: BookUser },
    { name: "Lost & Found", href: "/main/faculty/lost-found", icon: ShieldAlert },
    { name: "Profile", href: "/main/faculty/profile", icon: User },
  ];

  return <BaseNavBar navLinks={navLinks} />;
}
