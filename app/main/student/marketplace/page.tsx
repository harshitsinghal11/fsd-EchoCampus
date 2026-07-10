'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MarketList from "@/components/marketplace/MarketplaceList";
import MarketCreateForm from "@/components/marketplace/MarketplaceForm";
import { Store } from "lucide-react";

export default function MarketplacePage() {
  const [userEmail, setUserEmail] = useState("");

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
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-background text-text-primary">
      {/* Page Title */}
      <div className="flex flex-col gap-1 md:gap-2">
         <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
            <Store className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Student Marketplace
         </h1>
         <p className="text-sm md:text-base text-text-muted font-medium">Buy, sell, and trade items with fellow students.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mx-auto">

        {/* Market List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MarketList currentUserEmail={userEmail} />
        </div>

        {/* Create Form - Takes 1 column, sticky on large screens */}
        <div className="lg:col-span-1" id="action-form">
          <div className="lg:sticky lg:top-6">
            <MarketCreateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
