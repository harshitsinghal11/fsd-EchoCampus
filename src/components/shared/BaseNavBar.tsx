"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import React from "react";
import { ROUTES } from "@/lib/routes";

export interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface BaseNavBarProps {
  navLinks: NavLink[];
}

export default function BaseNavBar({ navLinks }: BaseNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    // 1. Supabase Sign Out
    await supabase.auth.signOut();

    // 2. Clear Local Storage
    sessionStorage.removeItem('userSessionCode');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');

    // 3. Close Menu & Redirect
    setIsMenuOpen(false);
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo Container */}
            <div className="flex items-center">
              <div className="shrink-0 flex items-center">
                <span className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Echo<span className="text-teal-400">Campus</span>
                </span>
              </div>
            </div>

            {/* Hamburger Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 z-50 group"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 transform transition-transform duration-300 group-hover:rotate-90" />
                ) : (
                  <Menu className="h-6 w-6 transform transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- SIDE MENU OVERLAY --- */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {/* Dark Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        />

        {/* Slide-out Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* 1. Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <span className="text-xl font-extrabold text-white tracking-tight">
              Echo<span className="text-teal-400">Campus</span>
            </span>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Scrollable Links Area */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-2">
              {navLinks.map((link, index) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={toggleMenu}
                    className={`group flex items-center px-4 py-3.5 rounded-xl text-sm md:text-base font-medium transition-all duration-200 
                      ${isActive
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-inner"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
                      }
                    `}
                    style={{
                      animationDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                      opacity: isMenuOpen ? 1 : 0,
                      transform: isMenuOpen ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'all 0.3s ease-out'
                    }}
                  >
                    <IconComponent
                      className={`w-5 h-5 mr-3 transition-colors 
                        ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}
                      `}
                    />
                    <span className="flex-1">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. Footer (Logout) - Pinned to bottom */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold text-sm md:text-base text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-900/20 active:scale-95 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
