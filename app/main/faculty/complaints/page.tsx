import { MessageSquare } from "lucide-react";
import ComplaintList from "@/components/complaints/ComplaintList";

export default function FacultyComplaintsPage() {
  return (
    <div className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      <header className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-teal-400" />
          Student Complaints
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium">
          Review concerns submitted by students and monitor community trends.
        </p>
      </header>

      <ComplaintList />
    </div>
  );
}
