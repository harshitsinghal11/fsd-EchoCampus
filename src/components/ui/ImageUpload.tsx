import React from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  imageUrl: string;
  onImageSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  label?: string;
  maxSizeText?: string;
}

export function ImageUpload({
  imageUrl,
  onImageSelected,
  onClear,
  label = "Item Photo",
  maxSizeText = "PNG, JPG up to 200KB",
}: ImageUploadProps) {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-semibold text-text-secondary">{label}</label>
      {imageUrl ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border group">
          <Image
            src={imageUrl}
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
            onClick={onClear}
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
            <p className="text-xs text-text-muted mt-1">{maxSizeText}</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageSelected}
          />
        </label>
      )}
    </div>
  );
}
