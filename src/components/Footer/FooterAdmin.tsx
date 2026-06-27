"use client";
import Link from 'next/link';
import { Mail, Linkedin, Instagram, Heart } from 'lucide-react';
import { ROUTES } from "@/lib/routes";

export default function FooterAdmin() {
  return (
    <footer className="bg-background border-t border-border/50 mt-auto relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-background pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center">
              Echo<span className="text-primary">Campus</span>
            </span>
            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              Empowering faculty with seamless campus connectivity,
              efficient directory access, and streamlined issue management.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href={ROUTES.SOCIAL.INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                className="text-text-disabled hover:text-primary transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={ROUTES.SOCIAL.LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="text-text-disabled hover:text-primary transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-text-primary font-semibold text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href={ROUTES.FACULTY.ANNOUNCEMENTS} className="text-text-muted hover:text-primary transition-colors duration-200 text-sm inline-flex items-center group">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href={ROUTES.FACULTY.DIRECTORY} className="text-text-muted hover:text-primary transition-colors duration-200 text-sm inline-flex items-center group">
                  Directory
                </Link>
              </li>
              <li>
                <Link href={ROUTES.FACULTY.LOST_FOUND} className="text-text-muted hover:text-primary transition-colors duration-200 text-sm inline-flex items-center group">
                  Lost & Found
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-text-primary font-semibold text-sm tracking-wider uppercase">Support</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:faculty-support@campus.edu" className="group flex items-center text-text-muted hover:text-primary transition-colors duration-200 text-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center mr-3 group-hover:border-primary/50 group-hover:bg-success/10 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  harshitsinghal.dev@outlook.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-text-disabled text-sm mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-danger" />
              <span>for Students by Student</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-text-disabled text-sm">
              <span>&copy; {new Date().getFullYear()} EchoCampus Admin. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href={ROUTES.LEGAL.PRIVACY} className="hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href={ROUTES.LEGAL.TERMS} className="hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
