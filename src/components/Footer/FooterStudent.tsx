"use client";
import Link from 'next/link';
import { Mail, ArrowUpRight, Linkedin, Instagram, ArrowRight, Heart } from 'lucide-react';
import { ROUTES } from "@/lib/routes";

export default function FooterStudent() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 mt-auto relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-2xl font-extrabold text-white tracking-tight flex items-center">
              Echo<span className="text-teal-400">Campus</span>
            </span>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering student life with seamless campus connectivity, 
              anonymous discussions, and instant marketplace access.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://www.instagram.com/harshitsinghal11" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-500 hover:text-teal-400 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/harshitsinghal11" 
                target="_blank" 
                rel="noreferrer" 
                className="text-slate-500 hover:text-teal-400 transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href={ROUTES.STUDENT.ANNOUNCEMENTS} className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm inline-flex items-center group">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Announcements
                </Link>
              </li>
              <li>
                <Link href={ROUTES.STUDENT.DIRECTORY} className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm inline-flex items-center group">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Directory
                </Link>
              </li>
              <li>
                <Link href={ROUTES.STUDENT.MARKETPLACE} className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm inline-flex items-center group">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href={ROUTES.STUDENT.LOST_FOUND} className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm inline-flex items-center group">
                  <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Lost & Found
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Support</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:echo@campus.edu" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mr-3 group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  echo@campus.edu
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mr-3 group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-colors">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  Help Center
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-slate-500 text-sm mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500" />
              <span>for students by Harshit Singhal</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-slate-500 text-sm">
              <span>&copy; {new Date().getFullYear()} EchoCampus. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href={ROUTES.LEGAL.PRIVACY} className="hover:text-teal-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href={ROUTES.LEGAL.TERMS} className="hover:text-teal-400 transition-colors duration-200">
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
