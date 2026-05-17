import { ShieldCheck, WalletCards, Users } from "lucide-react";
import {
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Platform Settings | MediLink",
};

const settings = [
  {
    title: "Tenant onboarding",
    description: "Default trial length, demo data, branch limits, and Uganda-ready account setup.",
    icon: Users,
  },
  {
    title: "Billing rules",
    description: "MTN MoMo, Airtel Money, bank transfer, invoice reminders, and renewal grace periods.",
    icon: WalletCards,
  },
  {
    title: "Platform controls",
    description: "Owner access, support routing, audit visibility, and account suspension controls.",
    icon: ShieldCheck,
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Platform control"
        title="Settings"
        description="Configure how MediLink handles tenants, billing, support, and platform owner access."
        icon={sectionIcons.settings}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <Card key={setting.title}>
              <CardHeader>
                <div className="grid size-12 place-items-center rounded-lg bg-violet-100 text-violet-700">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="mt-4">{setting.title}</CardTitle>
                <CardDescription>{setting.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  Ready for Supabase-backed configuration when live settings are connected.
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
