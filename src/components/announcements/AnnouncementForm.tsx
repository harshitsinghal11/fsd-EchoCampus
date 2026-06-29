"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { addAnnouncement } from "@/actions/announcementActions";
import { SubmitBtn } from "@/components/shared/SubmitBtn";

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
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 1. Title Input */}
      <div>
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">
          Subject / Title
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Exam Schedule Update"
          className="w-full p-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:bg-surface-hover focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* 2. Link Input (NEW) */}
      <div>
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">
          Attachment Link <span className="text-text-disabled font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LinkIcon className="h-4 w-4 text-text-disabled" />
          </div>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.example.com"
            className="w-full pl-10 p-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:bg-surface-hover focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* 3. Content Textarea */}
      <div>
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">
          Details
        </label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your announcement content here..."
          rows={5}
          className="w-full p-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:bg-surface-hover focus:ring-2 focus:ring-input-focus/50 focus:border-primary/50 outline-none transition-all text-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <SubmitBtn
        type="submit"
        disabled={loading}
        isSubmitting={loading}
        label="Publish Now"
      />
    </form>
  );
}
