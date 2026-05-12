"use client";

import ComplaintForm from "@/components/complaints/complaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";

export default function Page() {
  return (
    <div className="p-4 mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 overflow-hidden">
        <ComplaintList />
        <ComplaintForm />
      </div>
    </div>
  );
}
