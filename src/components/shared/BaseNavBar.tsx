"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const logoHref = pathname.startsWith("/main/faculty") ? ROUTES.FACULTY.DASHBOARD : ROUTES.STUDENT.DASHBOARD;

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
      <nav className="bg-surface backdrop-blur-xl border-b border-border sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo Container */}
            <div className="flex items-center">
              <Link href={logoHref} className="shrink-0 flex items-center hover:opacity-80 transition-opacity">
                <span className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight">
                  Echo<span className="text-primary">Campus</span>
                </span>
              </Link>
            </div>

            {/* Hamburger Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-input-focus/50 z-50 group"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 " />
                ) : (
                  <Menu className="h-6 w-6 " />
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
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-surface-hover border-l border-border shadow-2xl transition-duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* 1. Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link href={logoHref} onClick={toggleMenu} className="hover:opacity-80 transition-opacity">
              <span className="text-xl font-extrabold text-text-primary tracking-tight">
                Echo<span className="text-primary">Campus</span>
              </span>
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Links Area */}
          <div className="flex-1 py-6 px-4">
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
                        ? "bg-primary/20 text-primary border border-primary/30 shadow-inner"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent"
                      }
                    `}
                    style={{
                      animationDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                      transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                      transition: 'all 0.3s ease-out'
                    }}
                  >
                    <IconComponent
                      className={`w-5 h-5 mr-3 transition-colors 
                        ${isActive ? "text-primary" : "text-text-disabled group-hover:text-text-secondary"}
                      `}
                    />
                    <span className="flex-1">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. Footer (Logout) - Pinned to bottom */}
          <div className="p-6 border-t border-border bg-surface">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl font-semibold text-sm md:text-base text-danger bg-danger/10 border border-danger/20 hover:bg-danger/20 hover:border-danger/40 hover:shadow-lg hover:shadow-danger/20 transition-all duration-200 group"
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
