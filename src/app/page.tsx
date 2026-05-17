import { HomePageContent } from "@/components/marketing/home-page-content";
import { PublicHeader } from "@/components/marketing/public-header";

export const metadata = {
  title: "MediLink | Healthcare SaaS Demo",
  description:
    "Enterprise healthcare SaaS demo with role dashboards, hospital data, patient booking, pharmacy inventory, and deployment workflow.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#07082f]">
      <PublicHeader />
      <HomePageContent />
    </main>
  );
}
