import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PublicBookingPage } from "@/components/appointment/public-booking-page";
import { getPublicBookingData } from "@/lib/public-booking";
import { tenantSlugFromHost } from "@/lib/tenant-host";

async function getHostBookingData() {
  const headerStore = await headers();
  const tenantSlug = tenantSlugFromHost(headerStore.get("host"));
  if (!tenantSlug) return null;

  return getPublicBookingData(tenantSlug);
}

export async function generateMetadata() {
  const data = await getHostBookingData();

  return {
    title: data ? `Book Appointment | ${data.tenant.name}` : "Book Appointment | MediLink",
    description: data
      ? `Book an appointment with ${data.tenant.name} using MediLink.`
      : "Book an appointment through a MediLink clinic page.",
  };
}

export default async function HostBookingPage() {
  const data = await getHostBookingData();
  if (!data) notFound();

  return <PublicBookingPage data={data} />;
}
