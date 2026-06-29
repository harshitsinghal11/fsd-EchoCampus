import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/NavBar/NavBarAdmin";
import BottomNavFaculty from "@/components/NavBar/BottomNavFaculty";
import Footer from "@/components/Footer/FooterAdmin";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Navbar />
        <main className="flex-1 min-h-0">{children}</main>
        <Footer />
        <BottomNavFaculty />
      </div>
    </ProtectedRoute>
  );
}

