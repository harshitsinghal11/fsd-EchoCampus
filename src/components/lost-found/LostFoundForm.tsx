"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, UploadCloud, Search, MapPin, Phone, AlignLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { addLostFoundItem } from "@/actions/lostFoundActions";
import { analyzeLostItem } from "@/actions/aiActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormInput } from "@/components/shared/ui/FormInput";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";


export default function LostFoundForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location_found: "",
    contact_info: "",
    image_url: "",
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAutoFill = async () => {
    if (!fileToUpload && (!form.image_url || form.image_url.startsWith('blob:'))) {
      if (!fileToUpload) {
         toast.error("Please select an image first.");
         return;
      }
    }

    setIsAnalyzing(true);
    try {
      let finalImageUrl = form.image_url;

      if (fileToUpload && form.image_url.startsWith('blob:')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Session expired. Please login again.");
          setIsAnalyzing(false);
          return;
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${user.id}-temp-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('lost_found_images')
          .upload(fileName, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lost_found_images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
        setForm(prev => ({ ...prev, image_url: finalImageUrl }));
        setFileToUpload(null);
      }

      const result = await analyzeLostItem(finalImageUrl);
      if (result.error) throw new Error(result.error);

      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
      }));

      toast.success("✨ AI Auto-Filled Details!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze image";
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Session expired. Please login again.");
        return;
      }

      let finalImageUrl = form.image_url;
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('lost_found_images')
          .upload(fileName, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lost_found_images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const result = await addLostFoundItem({
        title: form.title,
        description: form.description,
        location_found: form.location_found,
        contact_info: form.contact_info,
        image_url: finalImageUrl
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Lost Item Reported Successfully!");
      setForm({ title: "", description: "", location_found: "", contact_info: "", image_url: "" });
      setFileToUpload(null);
      onSuccess();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isPhoneInvalid = form.contact_info?.length > 0 && form.contact_info.length !== 10;

  return (
    <GlassCard className="p-6 md:p-8 space-y-5">
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
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, image_url: "" });
                  setFileToUpload(null);
                }}
                className="absolute top-2 right-2 bg-surface-hover backdrop-blur text-text-secondary p-1.5 rounded-full hover:bg-danger/20 hover:text-danger transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer bg-surface hover:bg-surface-hover/60 hover:border-primary/50 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-text-disabled group-hover:text-primary mb-2 transition-colors" />
                <p className="text-sm text-text-muted font-medium group-hover:text-text-secondary transition-colors">Click to upload photo</p>
                <p className="text-xs text-text-disabled mt-1">(Max 200KB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          )}


        </div>

        {/* Title Input */}
        <FormInput
          label="What is it?"
          icon={Search}
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Realme TWS Earbuds"
        />

        {/* Two Column Grid for Location & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location Input */}
          <FormInput
            label="Location"
            icon={MapPin}
            required
            value={form.location_found}
            onChange={(e) => setForm({ ...form, location_found: e.target.value })}
            placeholder="e.g. Main Library, 2nd Floor"
          />

          {/* Contact No Input */}
          <FormInput
            label="Mobile Number"
            icon={Phone}
            required
            type="tel"
            value={form.contact_info}
            error={isPhoneInvalid}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) {
                setForm({ ...form, contact_info: val });
              }
            }}
            placeholder="10-digit mobile number"
          />
        </div>

        {/* Description Input */}
        <FormTextarea
          label="Description"
          icon={AlignLeft}
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Provide details (color, brand, scratches, distinguishing marks)..."
        />

        {/* Auto-Fill & Submit Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={isAnalyzing || loading || !form.image_url}
            className={`w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 py-3 px-4 border ${
              isAnalyzing
                ? "bg-primary/10 border-primary/30 text-primary animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-surface hover:bg-surface-hover border-border text-text shadow-sm hover:shadow-md hover:border-primary/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Sparkles size={18} className={isAnalyzing ? "animate-spin" : "text-primary"} />
            {isAnalyzing ? "AI is Analyzing Image..." : "✨ Auto-Fill Details from Image"}
          </button>
          
          <SubmitBtn
            disabled={loading || isPhoneInvalid}
            isSubmitting={loading}
            label="Submit Report"
          />
        </div>
      </form>
    </GlassCard>
  );
}
