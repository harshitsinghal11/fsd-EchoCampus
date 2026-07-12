"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CheckAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If logged in, fetch role to redirect correctly
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          if (userData.role === "student") {
            router.replace("/main/student/dashboard");
          } else {
            router.replace("/main/faculty/dashboard");
          }
        } else {
          // Fallback if role missing but session exists
          router.replace("/main/student/dashboard");
        }
      }
    };
    checkUser();
  }, [router]);

  return null;
}
