"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_TYPES, PHOTO_TYPE_LABELS, type PhotoType } from "@/lib/utils/enums";
import { recordFindingPhotoAction } from "./actions";

interface PhotoUploadProps {
  findingId: string;
  organizationId: string;
}

export function PhotoUpload({ findingId, organizationId }: PhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tip, setTip] = useState<PhotoType>("detection");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const supabase = createClient();

      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${organizationId}/findings/${findingId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("inspection-photos").upload(path, compressed, {
          contentType: compressed.type,
        });
        if (uploadError) throw new Error(uploadError.message);

        const result = await recordFindingPhotoAction(findingId, { storage_path: path, tip });
        if (result?.error) throw new Error(result.error);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="photo_tip">Fotoğraf Türü</Label>
          <Select value={tip} onValueChange={(v) => setTip(v as PhotoType)} items={PHOTO_TYPE_LABELS}>
            <SelectTrigger id="photo_tip" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHOTO_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {PHOTO_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {isUploading ? "Yükleniyor..." : "Fotoğraf Ekle"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>
      {error && <p className="text-sm text-risk-high">{error}</p>}
    </div>
  );
}
