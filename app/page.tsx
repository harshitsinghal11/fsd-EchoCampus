import Link from "next/link";
import {
  ArrowRight, Store, BellRing, MessageSquare, Mic, BookUser, ShieldAlert
} from "lucide-react";
import Footer from "@/components/Footer/FooterStudent";
import { ROUTES } from "@/lib/routes";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col font-sans">

      {/* 1. NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Echo<span className="text-primary">Campus</span>
        </h1>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-10 mb-20">
        <div className="bg-success/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm shadow-primary/20">
          The Ultimate Campus Companion
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight mb-6 leading-tight">
          Everything your campus <br />
          <span className="text-primary">in one place.</span>
        </h2>
        <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed">
          Connect, trade, and stay updated. EchoCampus bridges the gap between students
          and faculty with a secure, anonymous, and efficient platform.
        </p>

        <div className="flex gap-4">
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="flex items-center gap-2 px-8 py-4 bg-button-primary text-text-primary font-bold rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] group"
          >
            Get Started <ArrowRight className="w-5 h-5 " />
          </Link>
        </div>
      </main>

      {/* 3. FEATURES GRID */}
      <section className="bg-background py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-text-primary">
            Why use EchoCampus?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<BellRing className="w-6 h-6 text-primary" />}
              title="Announcements"
              desc="Never miss an update. Get official news from faculty instantly."
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
            />
            <FeatureCard
              icon={<Store className="w-6 h-6 text-primary" />}
              title="Marketplace"
              desc="Buy and sell books, gadgets, and notes securely within campus."
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
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-surface backdrop-blur-xl rounded-[1.5rem] border border-border">
      <div className="w-12 h-12 bg-surface-hover/80 border border-border rounded-xl flex items-center justify-center mb-5 shadow-sm">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-text-primary mb-2.5">{title}</h4>
      <p className="text-text-muted leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  );
}