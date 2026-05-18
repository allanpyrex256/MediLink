import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { getLocalDemoDocumentTemplate } from "@/lib/local-demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TenantDocumentTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

type TemplateContext = {
  params: Promise<{ templateId: string }>;
};

export async function GET(request: NextRequest, { params }: TemplateContext) {
  const { templateId } = await params;
  const disposition = responseDisposition(request);

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const template = await getLocalDemoDocumentTemplate({ workspaceId, templateId });

    if (!template) {
      return NextResponse.json({ error: "Blank form not found." }, { status: 404 });
    }

    return fileResponse({
      body: Buffer.from(template.content_base64, "base64"),
      contentType: template.content_type,
      disposition,
      fileName: template.file_name,
    });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Document storage needs SUPABASE_SERVICE_ROLE_KEY." },
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
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: template, error } = await admin
    .from("document_templates")
    .select("*")
    .eq("id", templateId)
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: "Blank form not found." }, { status: 404 });
  }

  const metadata = template as TenantDocumentTemplate;
  const download = await admin.storage
    .from("tenant-documents")
    .download(metadata.storage_path);

  if (download.error) {
    return NextResponse.json({ error: download.error.message }, { status: 404 });
  }

  return fileResponse({
    body: await download.data.arrayBuffer(),
    contentType: metadata.content_type,
    disposition,
    fileName: metadata.file_name,
  });
}

function responseDisposition(request: NextRequest) {
  return request.nextUrl.searchParams.get("disposition") === "inline"
    ? "inline"
    : "attachment";
}

function fileResponse({
  body,
  contentType,
  disposition,
  fileName,
}: {
  body: BodyInit;
  contentType: string;
  disposition: "inline" | "attachment";
  fileName: string;
}) {
  return new Response(body, {
    headers: {
      "Content-Disposition": `${disposition}; filename="${headerFileName(fileName)}"`,
      "Content-Type": contentType,
    },
  });
}

function headerFileName(fileName: string) {
  return fileName.replace(/["\r\n]/g, "");
}
