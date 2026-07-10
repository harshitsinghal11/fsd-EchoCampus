"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
import { Link as LinkIcon, Type, AlignLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addAnnouncement } from "@/actions/announcementActions";
import { enhanceAnnouncement } from "@/actions/aiActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";
import { GlassCard } from "@/components/shared/ui/GlassCard";
import { FormInput } from "@/components/shared/ui/FormInput";
import { FormTextarea } from "@/components/shared/ui/FormTextarea";
import { Button } from "@/components/ui/Button";

export default function AnnouncementForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState(""); // New State for Link
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
    <GlassCard className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleEnhance}
            disabled={isEnhancing || loading || !content.trim()}
            className={`w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 py-3.5 px-6 border ${isEnhancing
              ? "bg-primary/10 border-primary/30 text-primary animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              : "bg-surface hover:bg-surface-hover border-border text-text shadow-sm hover:shadow-md hover:border-primary/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Sparkles
              size={18}
              className={isEnhancing ? "animate-spin" : "text-primary"}
            />
            {isEnhancing ? "AI Thinking..." : "Enhance Note"}
          </button>

          <SubmitBtn
            type="submit"
            disabled={loading || isEnhancing}
            isSubmitting={loading}
            label="Publish Now"
            className="w-full m-0"
          />
        </div>
      </form>
    </GlassCard>
  );
}
