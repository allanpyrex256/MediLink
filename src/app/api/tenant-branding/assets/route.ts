import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BrandingAssetType = "logo" | "cover" | "profile";

const assetColumns: Record<BrandingAssetType, "logo_url" | "cover_image_url" | "profile_image_url"> = {
  cover: "cover_image_url",
  logo: "logo_url",
  profile: "profile_image_url",
};
const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const maxUploadBytes = 5 * 1024 * 1024;
const uploadRoles: UserRole[] = ["admin"];

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const uploadedFile = formData?.get("file");
  const assetType = normalizeAssetType(formData?.get("assetType"));

  if (!assetType) {
    return NextResponse.json({ error: "Choose whether this is a logo, cover image, or profile image." }, { status: 400 });
  }

  if (!(uploadedFile instanceof File)) {
    return NextResponse.json({ error: "Choose an image from your computer first." }, { status: 400 });
  }

  const validation = validateImage(uploadedFile);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Image preview works in demo mode, but saving needs Supabase configuration." },
      { status: 501 },
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Saving branding images needs SUPABASE_SERVICE_ROLE_KEY and the tenant-assets storage bucket." },
      { status: 500 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!profile || (!profile.is_platform_admin && !uploadRoles.includes(profile.role as UserRole))) {
    return NextResponse.json({ error: "Only tenant admins can update branding images." }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const safeName = safeFileName(uploadedFile.name);
  const storagePath = `${profile.tenant_id}/branding/${assetType}/${crypto.randomUUID()}-${safeName}`;
  const contentType = uploadedFile.type;
  const upload = await admin.storage
    .from("tenant-assets")
    .upload(storagePath, await uploadedFile.arrayBuffer(), {
      contentType,
      upsert: false,
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  const publicUrl = admin.storage.from("tenant-assets").getPublicUrl(storagePath).data.publicUrl;
  const { error } = await admin
    .from("tenants")
    .update({
      [assetColumns[assetType]]: publicUrl,
    })
    .eq("id", profile.tenant_id);

  if (error) {
    await admin.storage.from("tenant-assets").remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { assetType, url: publicUrl } }, { status: 201 });
}

function normalizeAssetType(value: FormDataEntryValue | null | undefined): BrandingAssetType | null {
  const normalized = String(value ?? "").toLowerCase();

  if (normalized === "logo" || normalized === "cover" || normalized === "profile") {
    return normalized;
  }

  return null;
}

function validateImage(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return "Choose a PNG, JPG, WEBP, or AVIF image.";
  }

  if (file.size <= 0) return "The selected image is empty.";
  if (file.size > maxUploadBytes) return "Images must be 5 MB or smaller.";

  return "";
}

function safeFileName(fileName: string) {
  const extension = extensionForFile(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${slugify(baseName) || "branding-image"}${extension}`;
}

function extensionForFile(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}
