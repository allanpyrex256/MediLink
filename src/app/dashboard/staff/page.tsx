import { format } from "date-fns";
import { Clock3, Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, getTenantStaffDirectory } from "@/lib/data/repositories";
import type { StaffInvitation, TenantStaffUser, UserRole } from "@/lib/types";
import { StaffInviteForm } from "./staff-invite-form";

const roleTone: Record<UserRole, "amber" | "blue" | "green" | "rose" | "slate"> = {
  admin: "rose",
  dentist: "green",
  doctor: "green",
  receptionist: "blue",
  pharmacist: "amber",
  patient: "slate",
};

const invitationTone: Record<StaffInvitation["status"], "amber" | "blue" | "green" | "rose" | "slate"> = {
  accepted: "green",
  expired: "rose",
  pending: "amber",
  sent: "blue",
};

export default async function StaffPage() {
  const data = await getDashboardData();

  if (data.user.role !== "admin" && !data.user.is_platform_admin) {
    redirect("/dashboard");
  }

  const directory = await getTenantStaffDirectory();
  const staffUsers = directory.users.filter((user) => user.role !== "patient");
  const activeInvitations = directory.invitations.filter((invite) => invite.status !== "accepted");
  const owners = staffUsers.filter((user) => user.role === "admin").length;

  return (
    <div>
      <PageHeading
        eyebrow="Owner access"
        title="Staff accounts"
        description={`Invite people into ${data.tenant.name} and control what each account can see or change.`}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Users} label="Workspace accounts" value={String(staffUsers.length)} tone="blue" />
        <SummaryCard icon={ShieldCheck} label="Owners / admins" value={String(owners)} tone="rose" />
        <SummaryCard icon={Clock3} label="Open invites" value={String(activeInvitations.length)} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                <Users className="size-5" />
              </div>
              <div>
                <CardTitle>Current team</CardTitle>
                <CardDescription>People who sign in under this same clinic, dental practice, hospital, or pharmacy tenant.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.map((user) => (
                  <StaffRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <CardTitle>Invite staff</CardTitle>
                  <CardDescription>The new account joins this same tenant with only the selected role permissions.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StaffInviteForm tenantKind={data.tenant.tenant_kind} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  <Mail className="size-5" />
                </div>
                <div>
                  <CardTitle>Invitations</CardTitle>
                  <CardDescription>Recent invite status for staff onboarding.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {directory.invitations.length ? (
                directory.invitations.slice(0, 6).map((invite) => (
                  <div key={invite.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{invite.full_name}</p>
                        <p className="mt-1 truncate text-xs font-medium text-slate-600">{invite.email}</p>
                      </div>
                      <Badge tone={invitationTone[invite.status]} className="capitalize">
                        {invite.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {roleLabel(invite.role)} - expires {formatDate(invite.expires_at)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-600">
                  No invitations have been sent yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Users;
  label: string;
  tone: "amber" | "blue" | "rose";
  value: string;
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-950">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StaffRow({ user }: { user: TenantStaffUser }) {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-5 py-4 font-bold text-slate-950">{user.full_name}</td>
      <td className="px-5 py-4 text-slate-700">{user.email}</td>
      <td className="px-5 py-4">
        <Badge tone={roleTone[user.role]}>{roleLabel(user.role)}</Badge>
      </td>
      <td className="px-5 py-4 text-slate-700">{user.phone ?? "Not set"}</td>
      <td className="px-5 py-4 text-slate-700">{formatDate(user.created_at)}</td>
    </tr>
  );
}

function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: "Owner / Admin",
    dentist: "Dentist",
    doctor: "Doctor",
    patient: "Patient",
    pharmacist: "Pharmacist",
    receptionist: "Receptionist",
  };

  return labels[role];
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  return format(new Date(value), "d MMM yyyy");
}
