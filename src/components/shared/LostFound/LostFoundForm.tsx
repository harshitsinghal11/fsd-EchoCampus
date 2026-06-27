"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, UploadCloud, Search, MapPin, Phone, AlignLeft, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { addLostFoundItem } from "@/actions/lostFoundActions";


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

      let finalImageUrl = "";
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
    <form
      onSubmit={handleSubmit}
      className="bg-surface backdrop-blur-xl border border-border rounded-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 space-y-5"
    >


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
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-text-secondary">What is it?</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
          </div>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Realme TWS Earbuds"
            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
          />
        </div>
      </div>

      {/* Two Column Grid for Location & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Location Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-text-secondary">Location</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
            </div>
            <input
              required
              value={form.location_found}
              onChange={(e) => setForm({ ...form, location_found: e.target.value })}
              placeholder="e.g. Main Library, 2nd Floor"
              className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover"
            />
          </div>
        </div>

        {/* Contact No Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-text-secondary">Mobile Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className={`h-5 w-5 transition-colors ${isPhoneInvalid ? 'text-danger' : 'text-text-disabled group-focus-within:text-primary'}`} />
            </div>
            <input
              required
              type="tel"
              value={form.contact_info}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) {
                  setForm({ ...form, contact_info: val });
                }
              }}
              placeholder="10-digit mobile number"
              className={`w-full pl-11 pr-4 py-3 md:py-3.5 bg-surface border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-surface-hover ${isPhoneInvalid
                ? "border-danger/50 focus:ring-danger/50 focus:border-danger/50"
                : "border-border focus:ring-input-focus/50 focus:border-primary/50"
                }`}
            />
          </div>
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
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide details (color, brand, scratches, distinguishing marks)..."
            className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 transition-all duration-200 hover:bg-surface-hover resize-none"
          />
        </div>
      </div>

      <button
        disabled={loading || isPhoneInvalid}
        className="w-full mt-2 bg-button-primary hover:bg-primary-hover text-text-primary py-3.5 px-6 rounded-xl font-semibold text-base md:text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-input-focus focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Report
          </>
        )}
      </button>
    </form>
  );
}
