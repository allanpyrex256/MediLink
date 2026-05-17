"use client";

import { useState, type FormEvent } from "react";
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
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PatientForm>(initialForm);
  const [saved, setSaved] = useState(false);

  function updateField(field: keyof PatientForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function closeDialog() {
    setOpen(false);
    setSaved(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add patient
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-patient-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
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

            <form onSubmit={handleSubmit} className="grid gap-5 p-5">
              {saved ? (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                  <span>
                    Patient details captured for this demo. Connect Supabase to save new
                    patients permanently.
                  </span>
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="size-4" />
                  Save patient details
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
