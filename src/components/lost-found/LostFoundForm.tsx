"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, Phone, AlignLeft, } from "lucide-react";
import { toast } from "sonner";
import { addLostFoundItem } from "@/actions/lostFoundActions";
import { analyzeLostItem } from "@/actions/aiActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { MagicButton } from "@/components/ui/MagicButton";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { uploadImageToSupabase } from "@/utils/storage";


export default function LostFoundForm({ onSuccess }: { onSuccess: () => void }) {
  const { loading, execute } = useFormSubmit();
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

        // Uses standard upload for temp images as it might not be tied to an item yet, 
        // but we can still use the utility if we want. Wait, the utility adds the prefix anyway.
        // Let's just use the utility:
        finalImageUrl = await uploadImageToSupabase(fileToUpload, 'lost_found_images', `${user.id}-temp`);
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

      toast.success("✨ AI Auto Filled Details!");
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

    await execute(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Session expired. Please login again.");
        }

        let finalImageUrl = form.image_url;
        if (fileToUpload) {
          finalImageUrl = await uploadImageToSupabase(fileToUpload, 'lost_found_images', user.id);
        }

        return addLostFoundItem({
          title: form.title,
          description: form.description,
          location_found: form.location_found,
          contact_info: form.contact_info,
          image_url: finalImageUrl
        });
      },
      () => {
        setForm({ title: "", description: "", location_found: "", contact_info: "", image_url: "" });
        setFileToUpload(null);
        onSuccess();
      },
      "Lost Item Reported Successfully!"
    );
  };

  const isPhoneInvalid = form.contact_info?.length > 0 && form.contact_info.length !== 10;
  const descriptionCharCount = form.description.length;
  const isDescriptionInvalid = descriptionCharCount > 50;
  const titleCharCount = form.title.length;
  const isTitleInvalid = titleCharCount > 30;

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
      <div>
        <FormInput
          label="What is it?"
          icon={Search}
          required
          value={form.title}
          error={isTitleInvalid}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Realme TWS Earbuds"
        />
        <div className="flex justify-end mt-1.5">
          <span className={`text-[11px] font-medium transition-colors ${isTitleInvalid ? 'text-danger' : 'text-text-disabled'}`}>
            {titleCharCount} / 30
          </span>
        </div>
      </div>

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
      <div>
        <FormTextarea
          label="Description"
          icon={AlignLeft}
          required
          rows={3}
          value={form.description}
          error={isDescriptionInvalid}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Provide details (color, brand, scratches, distinguishing marks)..."
        />
        <div className="flex justify-end mt-1.5">
          <span className={`text-[11px] font-medium transition-colors ${isDescriptionInvalid ? 'text-danger' : 'text-text-disabled'}`}>
            {descriptionCharCount} / 50
          </span>
        </div>
      </div>

      {/* Auto-Fill & Submit Buttons */}
      <div className="space-y-3 pt-2">
        <MagicButton
          onClick={handleAutoFill}
          disabled={isAnalyzing || loading || !form.image_url}
          isProcessing={isAnalyzing}
          label="Auto Fill"
          processingLabel="AI is Analyzing Image..."
        />

        <SubmitBtn
          disabled={loading || isPhoneInvalid || isDescriptionInvalid || isTitleInvalid}
          isSubmitting={loading}
          label="Submit Report"
        />
      </div>
    </form>
  );
}
