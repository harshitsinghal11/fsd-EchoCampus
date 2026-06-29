import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/NavBar/NavBarStudent";
import BottomNavStudent from "@/components/NavBar/BottomNavStudent";
import { StudentLayoutWrapper } from "./StudentLayoutWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Navbar />
        <StudentLayoutWrapper>
          {children}
        </StudentLayoutWrapper>
        <BottomNavStudent />
      </div>
    </ProtectedRoute>
  );
}
