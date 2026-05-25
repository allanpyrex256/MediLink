"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageUp, Loader2, Store, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type BrandingAssetType = "logo" | "cover" | "profile";

type SlotState = {
  error?: string;
  fileName?: string;
  previewUrl?: string | null;
  saved?: boolean;
  uploading?: boolean;
};

const slots: Array<{
  emptyText: string;
  icon: LucideIcon;
  label: string;
  type: BrandingAssetType;
}> = [
  { type: "logo", label: "Logo", emptyText: "Generated initials logo", icon: ImageUp },
  { type: "cover", label: "Cover image", emptyText: "Brand color cover", icon: ImageUp },
  { type: "profile", label: "Profile image", emptyText: "Business profile mark", icon: Store },
];

const maxImageBytes = 5 * 1024 * 1024;

export function BrandingImageUploads({
  canPersist,
  coverImageUrl,
  logoUrl,
  profileImageUrl,
}: {
  canPersist: boolean;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  profileImageUrl?: string | null;
}) {
  const router = useRouter();
  const initialUrls: Record<BrandingAssetType, string | null | undefined> = {
    logo: logoUrl,
    cover: coverImageUrl,
    profile: profileImageUrl,
  };
  const [slotState, setSlotState] = useState<Record<BrandingAssetType, SlotState>>({
    logo: { previewUrl: logoUrl },
    cover: { previewUrl: coverImageUrl },
    profile: { previewUrl: profileImageUrl },
  });

  async function chooseImage(type: BrandingAssetType, file: File | null) {
    if (!file) return;

    const validation = validateImage(file);
    if (validation) {
      setSlotState((current) => ({
        ...current,
        [type]: { ...current[type], error: validation, saved: false, uploading: false },
      }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSlotState((current) => {
      const previousUrl = current[type].previewUrl;
      if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);

      return {
        ...current,
        [type]: {
          error: canPersist ? undefined : "Preview only. Add production storage settings to save it permanently.",
          fileName: file.name,
          previewUrl: objectUrl,
          saved: false,
          uploading: canPersist,
        },
      };
    });

    if (!canPersist) return;

    const formData = new FormData();
    formData.set("assetType", type);
    formData.set("file", file);

    try {
      const response = await fetch("/api/tenant-branding/assets", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save image.");
      }

      setSlotState((current) => ({
        ...current,
        [type]: {
          fileName: file.name,
          previewUrl: payload.data?.url ?? objectUrl,
          saved: true,
          uploading: false,
        },
      }));
      router.refresh();
    } catch (caught) {
      setSlotState((current) => ({
        ...current,
        [type]: {
          ...current[type],
          error: caught instanceof Error ? caught.message : "Unable to save image.",
          saved: false,
          uploading: false,
        },
      }));
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {slots.map((slot) => (
        <BrandingImageSlot
          key={slot.type}
          {...slot}
          initialUrl={initialUrls[slot.type]}
          state={slotState[slot.type]}
          onChoose={(file) => chooseImage(slot.type, file)}
        />
      ))}
    </div>
  );
}

function BrandingImageSlot({
  emptyText,
  icon: Icon,
  initialUrl,
  label,
  onChoose,
  state,
}: {
  emptyText: string;
  icon: LucideIcon;
  initialUrl?: string | null;
  label: string;
  onChoose: (file: File | null) => void;
  state: SlotState;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = state.previewUrl ?? initialUrl;
  const status = state.uploading
    ? "Saving image..."
    : state.saved
      ? "Saved"
      : state.fileName ?? (previewUrl ? "Uploaded" : emptyText);

  return (
    <label className="group block cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/60">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => {
          onChoose(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />
      <div className="flex items-start gap-3">
        <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
          {previewUrl ? (
            // Blob URLs cannot be optimized by next/image, so a native img is the right fit for local previews.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon className="size-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">{label}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{status}</p>
          {state.error ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-amber-700">
              <XCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {state.error}
            </p>
          ) : state.saved ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Ready to use
            </p>
          ) : null}
        </div>
        {state.uploading ? (
          <Loader2 className="size-4 animate-spin text-sky-700" aria-hidden="true" />
        ) : null}
      </div>
      <span className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition group-hover:border-sky-300 group-hover:text-sky-700">
        Browse image
      </span>
    </label>
  );
}

function validateImage(file: File) {
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"];

  if (!allowedTypes.includes(file.type)) {
    return "Choose a PNG, JPG, WEBP, or AVIF image.";
  }

  if (file.size <= 0) return "The selected image is empty.";
  if (file.size > maxImageBytes) return "Images must be 5 MB or smaller.";

  return "";
}
