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

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <nav className="hidden md:block bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
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
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-50 group"
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
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        />

        {/* Slide-out Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-surface-hover border-l border-border shadow-lg transition-duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* 1. Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
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

          {/* 2. Links Area (No Scroll) */}
          <div className="flex-1 py-4 px-4 flex flex-col justify-center">
            <nav className="space-y-1">
              {navLinks.map((link, index) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={toggleMenu}
                    className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
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

        </div>
      </div>
    </>
  );
}
