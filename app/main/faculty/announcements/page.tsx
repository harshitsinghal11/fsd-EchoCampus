"use client";
import { useState } from "react";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import { Megaphone, PenLine } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function AdminAnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[100dvh] p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-background text-text-primary relative pb-24">
      {/* Page Title */}
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
          <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Announcement Center
        </h1>
        <p className="text-sm md:text-base text-text-muted font-medium">
          Manage campus-wide broadcasts and updates.
        </p>
      </div>

      {/* MAIN CONTENT - Full Width Feed */}
      <div className="w-full">
        <AnnouncementList />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-30"
      >
        <PenLine className="w-6 h-6" />
      </button>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create an Announcement"
      >
        <AnnouncementForm onSuccess={() => {
          setIsModalOpen(false);
        }} />
      </Modal>
    </div>
  );
}