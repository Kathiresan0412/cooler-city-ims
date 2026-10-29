"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Unsupported image", description: "Choose a JPG, PNG, WebP, or GIF image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "Choose an image smaller than 5 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data: unknown = await res.json().catch(() => null);
      const error = data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Image upload failed. Please try again.";
      const url = data && typeof data === "object" && "url" in data && typeof data.url === "string"
        ? data.url
        : null;

      if (!res.ok || !url) {
        toast({ title: "Could not upload image", description: error, variant: "destructive" });
        return;
      }

      onChange?.(url);
    } catch {
      toast({
        title: "Could not upload image",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted transition-colors hover:bg-muted/80", className)}>
      {value ? (
        <>
          <Image src={value} alt="Uploaded" fill className="rounded-lg object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-1 text-muted-foreground"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
          <span className="text-xs">{uploading ? "Uploading..." : "Upload image"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
