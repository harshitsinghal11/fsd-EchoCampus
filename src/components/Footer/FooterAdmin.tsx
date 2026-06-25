"use client";
import { Heart, Mail, MapPin, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold tracking-tight">
                Echo<span className="text-teal-400">Campus</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              EchoCampus is a comprehensive web platform designed to bridge the gap between students and campus resources,
              establishing the foundation for digital campus community building through modern web technologies.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/harshitsinghal11"
                className="w-10 h-10 bg-slate-900 border border-slate-800/50 rounded-lg flex items-center justify-center hover:bg-pink-500 hover:border-pink-500 transition-colors duration-200 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
              <a
                href="www.linkedin.com/in/harshitsinghal11"
                className="w-10 h-10 bg-slate-900 border border-slate-800/50 rounded-lg flex items-center justify-center hover:bg-teal-600 hover:border-teal-600 transition-colors duration-200 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/main/faculty/announcements" className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/main/faculty/directory" className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/main/faculty/lost-found" className="text-slate-400 hover:text-teal-400 transition-colors duration-200 text-sm">
                  Lost & Found
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center text-slate-400 text-sm">
                <Mail className="w-4 h-4 mr-3 text-teal-400" />
                <span>harshitsinghal.dev@outlook.com</span>
              </div>
              <div className="flex items-start text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-teal-400 shrink-0" />
                <span>Manav Rachna University<br /> Faridabad, 121004</span>              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-slate-500 text-sm mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-500" />
              <span>for students by Harshit Singhal</span>
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-slate-500 text-sm">
              <span>&copy; 2025 EchoCampus. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-teal-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-teal-400 transition-colors duration-200">
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
