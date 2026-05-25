import { BellRing, Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { PageHeading } from "@/components/dashboard/page-heading";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";

const channelIcon = {
  whatsapp: MessageCircle,
  email: Mail,
  sms: Smartphone,
  in_app: BellRing,
};

export default async function NotificationsPage() {
  const data = await getDashboardData();
  const isPharmacy = data.tenant.tenant_kind === "pharmacy";

  return (
    <div>
      <PageHeading
        eyebrow="Notifications"
        title={isPharmacy ? "Customer reminders" : "Patient reminders"}
        description={
          isPharmacy
            ? "Queued and sent pickup and delivery reminders through email, WhatsApp, and in-app notifications."
            : "Queued and sent appointment reminders through email, WhatsApp, and in-app notifications."
        }
        actions={
          <WorkflowActionButton
            title="Send reminder"
            description="Reminder sending is ready to become a WhatsApp, SMS, email, or in-app notification form connected to your providers."
          >
            <Send className="size-4" />
            Send reminder
          </WorkflowActionButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[ 
          { title: "WhatsApp reminders", icon: MessageCircle, caption: "Cloud API ready" },
          { title: "SMS reminders", icon: Smartphone, caption: "Missed-visit reduction" },
          { title: "Email confirmations", icon: Mail, caption: "Provider contract ready" },
          { title: "In-app alerts", icon: BellRing, caption: "Tenant inbox ready" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.caption}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Notification log</CardTitle>
          <CardDescription>
            {data.notifications.length
              ? "Latest tenant-scoped customer and patient messages."
              : "No notifications have been received yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {data.notifications.length ? data.notifications.map((notification) => {
            const Icon = channelIcon[notification.channel];
            return (
              <div
                key={notification.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-600">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{notification.subject}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{notification.body}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {format(new Date(notification.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <Badge tone={notification.status === "sent" ? "green" : notification.status === "failed" ? "rose" : "amber"} className="capitalize">
                  {notification.status}
                </Badge>
              </div>
            );
          }) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm font-medium leading-6 text-slate-500">
              New medicine requests, WhatsApp sends, and reminder events will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
