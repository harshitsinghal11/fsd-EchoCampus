import { MessageSquare } from "lucide-react";
import ComplaintList from "@/components/complaints/ComplaintList";

export default function FacultyComplaintsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
          <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Student Complaints
        </h1>
        <p className="text-sm md:text-base text-text-muted font-medium">
          Review concerns submitted by students and monitor community trends.
        </p>
      </header>

      <ComplaintList />
    </div>
  );
}
