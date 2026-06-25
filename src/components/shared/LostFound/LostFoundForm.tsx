"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, UploadCloud, Search, MapPin, Phone, AlignLeft, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";


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

      const { error } = await supabase.from("lost_found").insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        location_found: form.location_found,
        contact_info: form.contact_info,
        image_url: finalImageUrl,
        is_resolved: false
      });

      if (error) throw error;

      toast.success("Lost Item Reported Successfully!");
      setForm({ title: "", description: "", location_found: "", contact_info: "", image_url: "" });
      setFileToUpload(null);
      onSuccess();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message.includes("Daily limit reached")) {
        toast.error("Limit Reached: You can only post 2 items every 24 hours. Please try again tomorrow.");
      } else {
        toast.error("Error: " + message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPhoneInvalid = form.contact_info?.length > 0 && !/^(?:\+\d{1,3}[- ]?)?\d{10}$/.test(form.contact_info);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 space-y-5"
    >


      {/* Image Upload / Preview Area */}
      <div className="w-full space-y-1.5">
        <label className="block text-sm font-semibold text-slate-300">Item Photo</label>
        {form.image_url ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700/50 group">
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
              className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-slate-300 p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer bg-slate-900/30 hover:bg-slate-900/60 hover:border-teal-500/50 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-teal-400 mb-2 transition-colors" />
              <p className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Click to upload photo</p>
              <p className="text-xs text-slate-500 mt-1">(Max 200KB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* Title Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-300">What is it?</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          </div>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Realme TWS Earbuds"
            className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 hover:bg-slate-900/80"
          />
        </div>
      </div>

      {/* Two Column Grid for Location & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Location Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-300">Location</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
            </div>
            <input
              required
              value={form.location_found}
              onChange={(e) => setForm({ ...form, location_found: e.target.value })}
              placeholder="e.g. Main Library, 2nd Floor"
              className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 hover:bg-slate-900/80"
            />
          </div>
        </div>

        {/* Contact No Input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-300">Mobile Number</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className={`h-5 w-5 transition-colors ${isPhoneInvalid ? 'text-red-400' : 'text-slate-500 group-focus-within:text-teal-400'}`} />
            </div>
            <input
              required
              type="tel"
              value={form.contact_info}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d+]/g, "");
                if (val.indexOf("+") > 0) {
                  val = val.replace(/\+/g, "");
                }
                if (val.length <= 15) {
                  setForm({ ...form, contact_info: val });
                }
              }}
              placeholder="+91 9876543210 (10 digits)"
              className={`w-full pl-11 pr-4 py-3 md:py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-slate-900/80 ${isPhoneInvalid
                ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                : "border-slate-700/50 focus:ring-teal-500/50 focus:border-teal-500/50"
                }`}
            />
          </div>
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-300">Description</label>
        <div className="relative group">
          <div className="absolute top-3.5 left-0 pl-4 flex pointer-events-none">
            <AlignLeft className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
          </div>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide details (color, brand, scratches, distinguishing marks)..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 hover:bg-slate-900/80 resize-none"
          />
        </div>
      </div>

      <button
        disabled={loading || isPhoneInvalid}
        className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white py-3.5 px-6 rounded-xl font-semibold text-base md:text-lg shadow-lg shadow-teal-900/20 hover:shadow-teal-900/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
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
