import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { LayoutDashboard } from "lucide-react";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import MarketplaceList from "@/components/marketplace/MarketplaceList";
import ComplaintList from "@/components/complaints/ComplaintList";
import LostFoundList from "@/components/lost-found/LostFoundList";

export const metadata = {
  title: "Dashboard",
};
export default function StudentDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 text-text-primary">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary capitalize flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Hey! Welcome To EchoCampus
          </h1>
          <p className="text-sm md:text-base text-text-muted font-medium">
            Here&apos;s what&apos;s happening around campus today.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={ROUTES.STUDENT.CHAT}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-hover/80 hover:bg-surface-hover text-text-primary rounded-xl font-medium border border-border/50 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
          >
            Global Chat
          </Link>
          <Link
            href={ROUTES.STUDENT.DIRECTORY}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-hover/80 hover:bg-surface-hover text-text-primary rounded-xl font-medium border border-border/50 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
          >
            Directory
          </Link>
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

        {/* 1. LATEST ANNOUNCEMENTS (Full Width) */}
        <section className="lg:col-span-3 bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">

              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Latest Announcements</h2>
            </div>
            <Link
              href={ROUTES.STUDENT.ANNOUNCEMENTS}
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              View All

            </Link>
          </div>
          <AnnouncementList isWidget={true} />
        </section>

        {/* 2. NEWEST LISTINGS (Left 2/3) */}
        <section className="lg:col-span-2 bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">

              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Newest Listings</h2>
            </div>
            <Link
              href={ROUTES.STUDENT.MARKETPLACE}
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              Browse Market

            </Link>
          </div>
          <MarketplaceList isWidget={true} />
        </section>

        {/* 3. RECENT COMPLAINTS (Right 1/3) */}
        <section className="bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">

              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Recent Complaints</h2>
            </div>
            <Link
              href={ROUTES.STUDENT.COMPLAINTS}
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              View All

            </Link>
          </div>
          <ComplaintList isWidget={true} />
        </section>

        {/* 4. LOST & FOUND SECTION (Full Width at Bottom) */}
        <section className="lg:col-span-3 bg-surface backdrop-blur-xl rounded-3xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border shadow-xl">
          <div className="flex justify-between items-center mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">

              <h2 className="text-lg md:text-xl font-semibold text-text-primary">Recent Lost & Found</h2>
            </div>
            <Link
              href={ROUTES.STUDENT.LOST_FOUND}
              className="group flex items-center gap-1 text-xs md:text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              View All

            </Link>
          </div>
          <LostFoundList showSearch={false} />
        </section>

      </div>
    </div>
  );
}