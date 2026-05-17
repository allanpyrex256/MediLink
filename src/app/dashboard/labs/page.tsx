import { format } from "date-fns";
import { Download, FlaskConical, Upload } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";

const statusTone = {
  requested: "blue",
  processing: "amber",
  completed: "green",
  cancelled: "rose",
} as const;

export default async function LabsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/inventory");
  }

  const completed = data.labResults.filter((item) => item.status === "completed").length;
  const pending = data.labResults.length - completed;

  return (
    <div>
      <PageHeading
        eyebrow="Lab management"
        title="Requests and results"
        description="Track lab requests, upload results, print reports, and give doctors access to completed findings."
        actions={
          <>
            <WorkflowActionButton
              variant="secondary"
              title="Upload lab result"
              description="Result upload is ready to become a file and summary form tied to the selected lab request."
            >
              <Upload className="size-4" />
              Upload result
            </WorkflowActionButton>
            <WorkflowActionButton
              title="New lab request"
              description="Lab request capture is ready to become a form for patient, doctor, test type, priority, and billing."
            >
              <FlaskConical className="size-4" />
              New request
            </WorkflowActionButton>
          </>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Lab requests</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{data.labResults.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Completed results</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Pending lab work</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{pending}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lab worklist</CardTitle>
          <CardDescription>Doctor requests, result status, uploaded findings, and print-ready reports.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Test</th>
                <th className="px-5 py-3 font-semibold">Doctor</th>
                <th className="px-5 py-3 font-semibold">Requested</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Result</th>
                <th className="px-5 py-3 font-semibold">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.labResults.map((result) => {
                const patient = data.patients.find((item) => item.id === result.patient_id);
                return (
                  <tr key={result.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{patient?.full_name ?? "Patient"}</p>
                      <p className="mt-1 text-xs text-slate-500">{patient?.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{result.test_name}</td>
                    <td className="px-5 py-4 text-slate-700">{result.requested_by}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {format(new Date(result.requested_at), "MMM d, HH:mm")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[result.status]} className="capitalize">
                        {result.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {result.result_summary ?? "Awaiting upload"}
                    </td>
                    <td className="px-5 py-4">
                      <Button variant="ghost" size="sm" disabled={result.status !== "completed"}>
                        <Download className="size-4" />
                        Print
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
