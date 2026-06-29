"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer/FooterStudent";

export function StudentLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/main/student/chat";

  return (
    <>
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
    </>
  );
}
