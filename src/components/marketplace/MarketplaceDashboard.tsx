'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MarketList from "@/components/marketplace/MarketplaceList";
import MarketCreateForm from "@/components/marketplace/MarketplaceForm";
import { Store, PenLine } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export default function MarketplaceDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch email on client side
  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    }

    loadUser();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-background text-text-primary relative pb-24">
      {/* Page Title */}
      <div className="flex flex-col gap-1 md:gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
          <Store className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Student Marketplace
        </h1>
        <p className="text-sm md:text-base text-text-muted font-medium">Buy, sell, and trade items with fellow students.</p>
      </div>

      {/* Market List - Full Width */}
      <div className="w-full">
        <MarketList currentUserEmail={userEmail} />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-30 ${isModalOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <PenLine className="w-6 h-6" />
      </button>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post an Item"
      >
        <MarketCreateForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
