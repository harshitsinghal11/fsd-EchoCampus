"use client";
import {
  Tag,
  AlignLeft,
  IndianRupee,
  Mail,
  Phone,
} from 'lucide-react';
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import React, { useState } from "react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { addMarketplaceItem } from "@/actions/marketplaceActions";

export default function MarketCreateForm() {
  const userEmail = useUserEmail();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consolidated all fields into one state object
  const [form, setForm] = useState({
    product_title: "",
    description: "",
    price: "",
    contact_info: "",
  });

  // Added React.FormEvent type to fix the 'e' error
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Email not loaded. Please wait.");
      return;
    }
    if (form.contact_info.length !== 10) {
      toast.error("Contact info must be 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {

      const parsedPrice = Number(form.price);

      const result = await addMarketplaceItem({
        product_title: form.product_title,
        description: form.description,
        price: parsedPrice,
        contact_info: form.contact_info
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Item Published Successfully!");

      setForm({
        product_title: "",
        description: "",
        price: "",
        contact_info: "",
      });

      router.refresh();

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Connection failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  const isPhoneInvalid = form.contact_info.length > 0 && form.contact_info.length !== 10;
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface backdrop-blur-xl border border-border rounded-[1.5rem] md:rounded-3xl shadow-2xl p-6 md:p-8 space-y-5"
    >

      {/* Title Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-text-secondary">Product Title</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
          </div>
          <input
            placeholder="e.g., Engineering Graphics Textbook"
            required
            value={form.product_title}
            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
            onChange={(e) => setForm({ ...form, product_title: e.target.value })}
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-text-secondary">Description</label>
        <div className="relative group">
          <div className="absolute top-3.5 left-0 pl-4 flex pointer-events-none">
            <AlignLeft className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
          </div>
          <textarea
            placeholder="Condition, edition, features..."
            value={form.description}
            rows={3}
            className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover resize-none"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>

      {/* Grid for Price, Contact & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Price Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-text-secondary">Price</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Amount"
              value={form.price}
              className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                if (digitsOnly.length <= 6) setForm({ ...form, price: digitsOnly });
              }}
            />
          </div>
        </div>

        {/* Contact No Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-text-secondary">Contact Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className={`h-5 w-5 transition-colors ${isPhoneInvalid ? 'text-danger' : 'text-text-disabled group-focus-within:text-primary'}`} />
            </div>
            <input
              required
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              value={form.contact_info}
              className={`w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-surface-hover ${isPhoneInvalid
                ? "border-danger/50 focus:ring-danger/50 focus:border-danger/50"
                : "border-border focus:ring-input-focus/50 focus:border-primary/50"
                }`}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  setForm({ ...form, contact_info: val });
                }
              }}
            />
          </div>
        </div>

        {/* Email Input (Disabled) */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-semibold text-text-muted">Campus Email (Locked)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-text-disabled" />
            </div>
            <input
              className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border border-border rounded-xl text-text-disabled cursor-not-allowed select-none"
              value={userEmail || "Loading email..."}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <SubmitBtn
        disabled={
          !form.product_title ||
          !form.price ||
          form.contact_info.length !== 10 ||
          isSubmitting
        }
        isSubmitting={isSubmitting}
        label="Post"
      />
    </form>
  );
}
