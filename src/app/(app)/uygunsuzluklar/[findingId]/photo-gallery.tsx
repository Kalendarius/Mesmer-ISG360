import { PHOTO_TYPE_LABELS, type PhotoType } from "@/lib/utils/enums";
import { formatDateTime } from "@/lib/utils/date";

interface Photo {
  id: string;
  url: string | null;
  tip: PhotoType;
  created_at: string;
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-mesmer-text-muted">Henüz fotoğraf eklenmemiş.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => (
        <div key={photo.id} className="space-y-1">
          {photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={PHOTO_TYPE_LABELS[photo.tip]}
              className="aspect-square w-full rounded-md border border-mesmer-border object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-md border border-mesmer-border bg-mesmer-primary-light text-xs text-mesmer-text-muted">
              Yüklenemedi
            </div>
          )}
          <p className="text-xs font-medium text-mesmer-text">{PHOTO_TYPE_LABELS[photo.tip]}</p>
          <p className="text-[0.65rem] text-mesmer-text-muted">{formatDateTime(photo.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
