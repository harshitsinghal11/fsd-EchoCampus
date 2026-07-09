"use client";
import {
  Tag,
  AlignLeft,
  IndianRupee,
  Mail,
  Phone,
  Camera,
  X
} from 'lucide-react';
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import React, { useState } from "react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { addMarketplaceItem } from "@/actions/marketplaceActions";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormInput } from "@/components/shared/ui/FormInput";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";
import { Button } from "@/components/ui/Button";

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
    image_url: "",
  });

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      toast.error("Image too large! Please select an image under 200KB.");
      return;
    }

    setFileToUpload(file);
    setForm({ ...form, image_url: URL.createObjectURL(file) });
  };

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
      let finalImageUrl = "";
      if (fileToUpload) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fileExt = fileToUpload.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('marketplace_images')
            .upload(fileName, fileToUpload);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('marketplace_images')
            .getPublicUrl(fileName);

          finalImageUrl = publicUrl;
        }
      }

      const parsedPrice = Number(form.price);

      const result = await addMarketplaceItem({
        product_title: form.product_title,
        description: form.description,
        price: parsedPrice,
        contact_info: form.contact_info,
        image_url: finalImageUrl
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
        image_url: "",
      });
      setFileToUpload(null);

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
    <GlassCard className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload / Preview Area */}
        <div className="w-full space-y-1.5">
          <label className="block text-sm font-semibold text-text-secondary">Item Photo</label>
          {form.image_url ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border group">
              <Image
                src={form.image_url}
                alt="Preview"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
              <Button
                type="button"
                variant="danger"
                size="icon"
                onClick={() => {
                  setForm({ ...form, image_url: "" });
                  setFileToUpload(null);
                }}
                className="absolute top-2 right-2 !rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-surface-hover hover:border-primary/50 transition-all group relative overflow-hidden bg-surface">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 bg-surface-hover rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-text-disabled group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-text-secondary">
                  Tap to upload photo
                </p>
                <p className="text-xs text-text-muted mt-1">PNG, JPG up to 200KB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        {/* Title Input */}
        <FormInput
          label="Product Title"
          icon={Tag}
          required
          placeholder="e.g., Engineering Graphics Textbook"
          value={form.product_title}
          onChange={(e) => setForm({ ...form, product_title: e.target.value })}
        />

        {/* Description Input */}
        <FormTextarea
          label="Description"
          icon={AlignLeft}
          placeholder="Condition, edition, features..."
          value={form.description}
          rows={3}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Grid for Price, Contact & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Price Input */}
          <FormInput
            label="Price"
            icon={IndianRupee}
            type="text"
            inputMode="numeric"
            placeholder="Amount"
            value={form.price}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "");
              if (digitsOnly.length <= 6) setForm({ ...form, price: digitsOnly });
            }}
          />

          {/* Contact No Input */}
          <FormInput
            label="Contact Number"
            icon={Phone}
            required
            type="tel"
            inputMode="numeric"
            placeholder="10-digit number"
            value={form.contact_info}
            error={isPhoneInvalid}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) {
                setForm({ ...form, contact_info: val });
              }
            }}
          />

          {/* Email Input (Disabled) */}
          <div className="md:col-span-2">
            <FormInput
              label="Campus Email (Locked)"
              icon={Mail}
              value={userEmail || "Loading email..."}
              disabled
              className="text-text-disabled cursor-not-allowed select-none"
            />
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
    </GlassCard>
  );
}
