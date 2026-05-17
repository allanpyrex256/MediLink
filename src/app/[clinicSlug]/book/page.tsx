import { notFound } from "next/navigation";
import { PublicBookingPage } from "@/components/appointment/public-booking-page";
import { getPublicBookingData } from "@/lib/public-booking";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicBookingData(clinicSlug);

  return {
    title: data ? `Book Appointment | ${data.tenant.name}` : "Book Appointment | MediLink",
    description: data
      ? `Book an appointment with ${data.tenant.name} using MediLink.`
      : "Book an appointment through a MediLink clinic page.",
  };
}

export default async function PublicClinicBookingPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicBookingData(clinicSlug);

  if (!data) notFound();

  return <PublicBookingPage data={data} />;
}
