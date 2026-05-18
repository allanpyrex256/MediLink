"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialForm = {
  fullName: "",
  phone: "",
  sex: "female",
  dateOfBirth: "",
  address: "",
  nextOfKin: "",
  medicalHistory: "",
  allergies: "",
  notes: "",
};

type PatientForm = typeof initialForm;

export function AddPatientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PatientForm>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof PatientForm, value: string) {
    setMessage("");
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save patient details.");
      }

      setForm(initialForm);
      setMessage(
        payload.demo
          ? "Patient saved in the local demo store. Add Supabase keys for permanent production storage."
          : "Patient saved to Supabase. The registry will stay updated after refresh.",
      );
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save patient details.");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setOpen(false);
    setMessage("");
    setError("");
  }

  return (
    <>
      <Suspense fallback={null}>
        <AddPatientDialogAutoOpen setOpen={setOpen} />
      </Suspense>

      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add patient
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/45 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-patient-title"
            className="my-auto flex max-h-[calc(100svh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-sky-700">
                    Patient registration
                  </p>
                  <h3 id="add-patient-title" className="mt-1 text-xl font-bold text-slate-950">
                    Add patient details
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Capture the core details reception needs before consultation, billing, or lab work.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Close add patient form"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="grid gap-5">
                  {message ? (
                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                      <span>{message}</span>
                    </div>
                  ) : null}
                  {error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Full name"
                      name="fullName"
                      placeholder="Sarah Nakato"
                      value={form.fullName}
                      onChange={(event) => updateField("fullName", event.target.value)}
                      required
                    />
                    <Input
                      label="Phone number"
                      name="phone"
                      placeholder="+256 700 123 456"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      required
                    />
                    <Select
                      label="Sex"
                      name="sex"
                      value={form.sex}
                      onChange={(event) => updateField("sex", event.target.value)}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </Select>
                    <Input
                      label="Date of birth"
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(event) => updateField("dateOfBirth", event.target.value)}
                    />
                    <Input
                      label="Address"
                      name="address"
                      placeholder="Kireka, Kampala"
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                    />
                    <Input
                      label="Next of kin"
                      name="nextOfKin"
                      placeholder="Brian Kato - +256 772 000 111"
                      value={form.nextOfKin}
                      onChange={(event) => updateField("nextOfKin", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      label="Medical history"
                      name="medicalHistory"
                      placeholder="Hypertension, diabetes, asthma..."
                      value={form.medicalHistory}
                      onChange={(event) => updateField("medicalHistory", event.target.value)}
                    />
                    <Textarea
                      label="Allergies"
                      name="allergies"
                      placeholder="Penicillin, peanuts, none recorded..."
                      value={form.allergies}
                      onChange={(event) => updateField("allergies", event.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Visit notes"
                    name="notes"
                    placeholder="Reason for visit, symptoms, triage notes, or referral details..."
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                  />
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="size-4" />
                    {loading ? "Saving..." : "Save patient details"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AddPatientDialogAutoOpen({ setOpen }: { setOpen: (open: boolean) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "add-patient") {
      setOpen(true);
    }
  }, [searchParams, setOpen]);

  return null;
}
