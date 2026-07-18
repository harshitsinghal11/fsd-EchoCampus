"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
import { Link as LinkIcon, Type, AlignLeft, } from "lucide-react";
import { toast } from "sonner";
import { addAnnouncement } from "@/actions/announcementActions";
import { enhanceAnnouncement } from "@/actions/aiActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { MagicButton } from "@/components/ui/MagicButton";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { useFormSubmit } from "@/hooks/useFormSubmit";

export default function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { loading, execute } = useFormSubmit();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  async function handleEnhance() {
    if (!content.trim()) {
      toast.error("Please enter a brief note to enhance first.");
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhanceAnnouncement(content);
      if (result.error) throw new Error(result.error);

      if (result.enhancedText) {
        setContent(result.enhancedText);
        toast.success("✨ AI Enhanced!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to enhance.");
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await execute(
      () => addAnnouncement({ title, content, link }),
      () => {
        setTitle("");
        setContent("");
        setLink("");
        if (onSuccess) onSuccess();
        router.refresh();
      },
      "Announcement posted!"
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      {/* 1. Title Input */}
      <FormInput
        label="Subject / Title"
        icon={Type}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Exam Schedule Update"
      />

      {/* 2. Link Input (NEW) */}
      <FormInput
        label="Attachment Link (optional)"
        icon={LinkIcon}
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://www.example.com"
      />

      {/* 3. Content Textarea */}
      <FormTextarea
        label="Details"
        icon={AlignLeft}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your announcement content here (or use AI Enhance)..."
        rows={5}
        disabled={isEnhancing}
      />

      {/* Submit Button & AI Button */}
      <div className="pt-2 flex flex-col gap-3">
        <MagicButton
          onClick={handleEnhance}
          disabled={isEnhancing || loading || !content.trim()}
          isProcessing={isEnhancing}
          label="Enhance Note"
          processingLabel="AI Thinking..."
        />

        <SubmitBtn
          type="submit"
          disabled={loading || isEnhancing}
          isSubmitting={loading}
          label="Publish Now"
          className="w-full m-0"
        />
      </div>
    </form>
  );
}