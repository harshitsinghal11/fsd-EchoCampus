"use client";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface ProfileActionsProps {
  dashboardRoute: string;
}

export default function ProfileActions({ dashboardRoute }: ProfileActionsProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("userSessionCode");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/auth/login");
  };

  return (
    <div className="mt-10 pt-8 border-t border-border flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
      <button
        onClick={() => router.push(dashboardRoute)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-text-primary bg-surface-hover hover:bg-surface-hover/80 border border-border transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <button
        onClick={handleLogout}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
