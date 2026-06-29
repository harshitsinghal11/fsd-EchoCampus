'use client';

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/NavBar/NavBarStudent";
import BottomNavStudent from "@/components/NavBar/BottomNavStudent";
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
      <div className="flex min-h-dvh flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Navbar />
        
        {/* We use a ternary operator to give the chat page its strict layout, 
            while giving normal pages a simple "flex-1" so they don't break. */}
        <main 
          className={
            isChatRoute 
              ? "relative flex-1 flex flex-col min-h-0" 
              : "flex-1"
          }
        >
          {children}
        </main>

        {!isChatRoute && <Footer />}
        <BottomNavStudent />
      </div>
    </ProtectedRoute>
  );
}