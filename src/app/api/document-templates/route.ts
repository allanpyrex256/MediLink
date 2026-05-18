import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { getTenantDocumentTemplates } from "@/lib/data/repositories";
import { saveLocalDemoDocumentTemplate } from "@/lib/local-demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TenantDocumentTemplate, UserRole } from "@/lib/types";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const maxUploadBytes = 5 * 1024 * 1024;
const allowedExtensions = [".pdf", ".doc", ".docx", ".html", ".htm", ".txt", ".png", ".jpg", ".jpeg"];
const uploadRoles: UserRole[] = ["admin", "receptionist"];

export async function GET() {
  const templates = await getTenantDocumentTemplates();

  return NextResponse.json({ data: templates });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const uploadedFile = formData?.get("file");
  const name = String(formData?.get("name") ?? "").trim();

  if (!(uploadedFile instanceof File)) {
    return NextResponse.json({ error: "Choose a blank form file to upload." }, { status: 400 });
  }

  const validation = validateTemplateFile(uploadedFile);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const now = new Date().toISOString();
    const template = await saveLocalDemoDocumentTemplate({
      workspaceId,
      template: {
        id: `local-doc-${crypto.randomUUID()}`,
        tenant_id: demo.tenant.id,
        name: name || titleFromFileName(uploadedFile.name),
        file_name: uploadedFile.name,
        content_type: contentTypeForFile(uploadedFile),
        size_bytes: uploadedFile.size,
        storage_path: `local-demo/${workspaceId}/${uploadedFile.name}`,
        created_by: null,
        created_at: now,
        updated_at: now,
        content_base64: Buffer.from(arrayBuffer).toString("base64"),
      },
    });

    return NextResponse.json({ data: template, demo: true }, { status: 201 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      {
        error:
          "File uploads need SUPABASE_SERVICE_ROLE_KEY so MediLink can store tenant document templates.",
      },
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
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !uploadRoles.includes(profile.role as UserRole)) {
    return NextResponse.json(
      { error: "Only admin or reception staff can upload facility forms." },
      { status: 403 },
    );
  }

  const admin = createSupabaseAdminClient();
  const safeName = safeFileName(uploadedFile.name);
  const storagePath = `${profile.tenant_id}/blank-forms/${crypto.randomUUID()}-${safeName}`;
  const upload = await admin.storage
    .from("tenant-documents")
    .upload(storagePath, await uploadedFile.arrayBuffer(), {
      contentType: contentTypeForFile(uploadedFile),
      upsert: false,
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  const { data, error } = await admin
    .from("document_templates")
    .insert({
      tenant_id: profile.tenant_id,
      name: name || titleFromFileName(uploadedFile.name),
      file_name: uploadedFile.name,
      content_type: contentTypeForFile(uploadedFile),
      size_bytes: uploadedFile.size,
      storage_path: storagePath,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    await admin.storage.from("tenant-documents").remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: data as TenantDocumentTemplate }, { status: 201 });
}

function validateTemplateFile(file: File) {
  const extension = extensionForFile(file.name);

  if (!allowedExtensions.includes(extension)) {
    return "Upload a PDF, Word document, HTML, text file, or image.";
  }

  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > maxUploadBytes) return "Blank form uploads must be 5 MB or smaller.";

  return "";
}

function contentTypeForFile(file: File) {
  if (file.type) return file.type;

  const extension = extensionForFile(file.name);
  const types: Record<string, string> = {
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".htm": "text/html",
    ".html": "text/html",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".txt": "text/plain",
  };

  return types[extension] ?? "application/octet-stream";
}

function extensionForFile(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

function titleFromFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function safeFileName(fileName: string) {
  const extension = extensionForFile(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${slugify(baseName) || "blank-form"}${extension}`;
}
