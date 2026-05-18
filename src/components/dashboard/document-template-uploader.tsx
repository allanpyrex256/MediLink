"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DocumentTemplateUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setStatus({ kind: "error", message: "Choose the blank form file first." });
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("file", file);

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/document-templates", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload blank form.");
      }

      setName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({
        kind: "success",
        message: "Blank form uploaded. It is now available to view and download.",
      });
      router.refresh();
    } catch (caught) {
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "Unable to upload blank form.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={uploadTemplate}
      className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <UploadCloud className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950">Upload your own blank form</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            Add your clinic, dental practice, or hospital PDF, Word document, image, HTML, or text form.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto] lg:items-end">
        <Input
          label="Form name"
          placeholder="Antenatal intake form"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Blank form file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.html,.htm,.txt,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,text/html,text/plain"
            className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-1 file:text-sm file:font-bold file:text-sky-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          Upload form
        </Button>
      </div>

      {status ? (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm font-semibold leading-6 ${
            status.kind === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{status.message}</span>
        </div>
      ) : null}
    </form>
  );
}
