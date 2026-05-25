import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Account paused | MediLink",
};

export default async function AccountPausedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const disabled = params.status === "disabled";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4 grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
            {disabled ? <AlertTriangle className="size-6" /> : <CreditCard className="size-6" />}
          </div>
          <CardTitle>{disabled ? "Account access is disabled" : "Subscription payment is due"}</CardTitle>
          <CardDescription>
            {disabled
              ? "This workspace has been paused by the MediLink platform owner."
              : "This workspace trial or subscription has ended. Access will resume after payment is accepted."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">
            Contact MediLink support or the platform owner to confirm payment and restore dashboard access.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
