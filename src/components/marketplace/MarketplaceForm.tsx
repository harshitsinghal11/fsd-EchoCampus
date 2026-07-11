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
import { ImageUpload } from "@/components/shared/ui/ImageUpload";
import { uploadImageToSupabase } from "@/utils/storage";
import React, { useState } from "react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { addMarketplaceItem } from "@/actions/marketplaceActions";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { FormInput } from "@/components/shared/ui/FormInput";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";
import { Button } from "@/components/ui/Button";

export default function MarketCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const userEmail = useUserEmail();
  const router = useRouter();

  const { loading, execute } = useFormSubmit();

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

    await execute(
      async () => {
        let finalImageUrl = "";
        if (fileToUpload) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            finalImageUrl = await uploadImageToSupabase(fileToUpload, 'marketplace_images', user.id);
          }
        }

        const parsedPrice = Number(form.price);

        return addMarketplaceItem({
          product_title: form.product_title,
          description: form.description,
          price: parsedPrice,
          contact_info: form.contact_info,
          image_url: finalImageUrl
        });
      },
      () => {
        setForm({
          product_title: "",
          description: "",
          price: "",
          contact_info: "",
          image_url: "",
        });
        setFileToUpload(null);
        if (onSuccess) onSuccess();
        router.refresh();
      },
      "Item Published Successfully!"
    );
  }
  const isPhoneInvalid = form.contact_info.length > 0 && form.contact_info.length !== 10;
  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {/* Image Upload / Preview Area */}
      <ImageUpload
        imageUrl={form.image_url}
        onImageSelected={handleImageUpload}
        onClear={() => {
          setForm({ ...form, image_url: "" });
          setFileToUpload(null);
        }}
      />

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
            loading
          }
          isSubmitting={loading}
          label="Post"
        />
    </form>
  );
}
