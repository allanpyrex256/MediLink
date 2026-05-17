import { HomePageContent } from "@/components/marketing/home-page-content";
import { PublicHeader } from "@/components/marketing/public-header";

export const metadata = {
  title: "MediLink | Clinic Management Software Uganda",
  description:
    "A complete digital system for managing clinics, prescriptions, billing, and patient care in Uganda.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#07082f]">
      <PublicHeader />
      <HomePageContent />
    </main>
  );
}
