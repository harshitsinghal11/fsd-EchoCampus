import Navbar from "@/components/NavBar/NavBarAdmin";
import BottomNavFaculty from "@/components/NavBar/BottomNavFaculty";
import Footer from "@/components/Footer/FooterAdmin";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabaseServer";

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

  let role = user.user_metadata?.role;
  if (!role) {
    const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
    role = data?.role;
  }

  if (role !== "faculty" && role !== "admin") {
    redirect("/main/student/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar />
      <main className="flex-1 min-h-0">{children}</main>
      <Footer />
      <BottomNavFaculty />
    </div>
  );
}

