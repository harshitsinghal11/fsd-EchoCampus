'use client';

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/NavBar/NavBarStudent";
import Footer from "@/components/Footer/FooterStudent";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/main/student/chat";

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh flex-col bg-slate-950">
        <Navbar />
        <main
          className={
            isChatRoute
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1"
          }
        >
          {children}
        </main>
        {!isChatRoute && <Footer />}
      </div>
    </ProtectedRoute>
  );
}
