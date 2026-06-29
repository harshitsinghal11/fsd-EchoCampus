"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { addAnnouncement } from "@/actions/announcementActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormInput } from "@/components/shared/ui/FormInput";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";

export default function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState(""); // New State for Link

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addAnnouncement({ title, content, link });

      if (result.error) {
        throw new Error(result.error);
      }

      // Reset Form
      setTitle("");
      setContent("");
      setLink("");
      toast.success("Announcement posted!");
      if (onSuccess) onSuccess();
      router.refresh();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Title Input */}
        <FormInput
          label="Subject / Title"
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
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your announcement content here..."
          rows={5}
        />

        {/* Submit Button */}
        <SubmitBtn
          type="submit"
          disabled={loading}
          isSubmitting={loading}
          label="Publish Now"
        />
      </form>
    </GlassCard>
  );
}
