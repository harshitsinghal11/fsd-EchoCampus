"use client";

import { usePathname } from "next/navigation";
import AppFooter from "@/components/footer/AppFooter";

export function MainLayoutWrapper({ 
  children, 
  role 
}: { 
  children: React.ReactNode;
  role: "student" | "faculty" | "admin";
}) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/main/student/chat";

  return (
    <>
      <main 
        className={
          isChatRoute 
            ? "relative flex-1 flex flex-col min-h-0" 
            : "flex-1 min-h-0"
        }
      >
        {children}
      </main>
      {!isChatRoute && <AppFooter role={role} />}
    </>
  );
}
