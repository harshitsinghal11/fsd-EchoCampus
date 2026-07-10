import Link from "next/link";
import {
  ArrowRight, Store, BellRing, MessageSquare, Mic, BookUser, ShieldAlert
} from "lucide-react";
import Footer from "@/components/Footer/FooterStudent";
import { ROUTES } from "@/lib/routes";
import CheckAuthRedirect from "@/components/CheckAuthRedirect";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Home",
};

export default function Home() {
  return (
      <div className="min-h-[100dvh] bg-background flex flex-col font-sans">
        <CheckAuthRedirect />

        {/* 1. NAVBAR */}
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Echo<span className="text-primary">Campus</span>
          </h1>
        </nav>

        {/* 2. HERO SECTION */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-16 md:mt-24 mb-24 md:mb-32">
          <div className="bg-success/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8 shadow-sm">
            The Ultimate Campus Companion
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-text-primary tracking-tighter mb-8 leading-[1.1]">
            Everything your campus <br className="hidden md:block" />
            <span className="text-primary">in one place.</span>
          </h2>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 leading-relaxed">
            Connect, trade, and stay updated. EchoCampus bridges the gap between students
            and faculty with a secure, anonymous, and efficient platform.
          </p>

          <div className="flex gap-4">
            <Button
              href={ROUTES.AUTH.LOGIN}
              size="lg"
              className="group font-bold"
            >
              Get Started <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </main>

        {/* 3. FEATURES GRID */}
        <section className="bg-background py-24 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-3xl md:text-5xl font-extrabold text-center mb-16 text-text-primary tracking-tight">
              Why use EchoCampus?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<BellRing className="w-6 h-6 text-primary" />}
                title="Announcements"
                desc="Never miss an update. Get official news from faculty instantly."
                className="lg:col-span-2"
              />
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6 text-primary" />}
                title="Anonymous Chats"
                desc="Connect with peers securely without revealing your identity."
              />
              <FeatureCard
                icon={<Mic className="w-6 h-6 text-primary" />}
                title="Complaints"
                desc="Voice your concerns safely to the administration."
              />
              <FeatureCard
                icon={<BookUser className="w-6 h-6 text-primary-light" />}
                title="Directory"
                desc="Find and connect with faculty members easily."
              />
              <FeatureCard
                icon={<ShieldAlert className="w-6 h-6 text-primary" />}
                title="Lost & Found"
                desc="Lost something? Report it and find it faster than ever."
                className="md:col-span-2 lg:col-span-1"
              />
              <FeatureCard
                icon={<Store className="w-6 h-6 text-primary" />}
                title="Marketplace"
                desc="Buy and sell books, gadgets, and notes securely within campus."
                className="lg:col-span-2"
              />
            </div>
          </div>
        </section>

        {/* 4. FOOTER */}
        <Footer />
      </div>
      );
}

      function FeatureCard({
        icon,
        title,
        desc,
        className = "",
}: {
        icon: React.ReactNode;
      title: string;
      desc: string;
      className?: string;
}) {
  return (
      <div className={`p-8 bg-surface rounded-2xl flex flex-col items-start hover:bg-surface-hover transition-colors duration-300 ${className}`}>
        <div className="w-12 h-12 bg-surface-hover/80 border border-border rounded-xl flex items-center justify-center mb-6">
          {icon}
        </div>
        <h4 className="text-xl font-bold text-text-primary mb-3 tracking-tight">{title}</h4>
        <p className="text-text-muted leading-relaxed">{desc}</p>
      </div>
      );
}