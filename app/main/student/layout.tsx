import AppNavbar from "@/components/Navbar/AppNavbar";
import AppBottomNav from "@/components/Navbar/AppBottomNav";
import { MainLayoutWrapper } from "@/components/shared/MainLayoutWrapper";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { ROUTES } from "@/lib/routes";
import { EchoWidget } from "@/components/chat/EchoWidget";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Get role from metadata; if missing, query it once
  let role = user.user_metadata?.role;
  if (!role) {
    const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
    role = data?.role;
  }

  if (role !== "student") {
    if (role === "faculty" || role === "admin") {
      redirect(ROUTES.FACULTY.DASHBOARD);
    } else {
      redirect(ROUTES.AUTH.LOGIN);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <AppNavbar role={role as "student" | "faculty" | "admin"} />
      <MainLayoutWrapper role={role as "student" | "faculty" | "admin"}>
        {children}
      </MainLayoutWrapper>
      <AppBottomNav role={role as "student" | "faculty" | "admin"} />
      <EchoWidget />
    </div>
  );
}
