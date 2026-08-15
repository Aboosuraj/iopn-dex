import WalletCard from "@/components/dashboard/WalletCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TrendingPreview from "@/components/dashboard/TrendingPreview";

export default function AppDashboard() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <div className="mx-auto max-w-7xl px-6 pb-8">

        <WalletCard />

        <QuickActions />

        <MarketOverview />

        <TrendingPreview />

      </div>

    </main>
  );
}