import Hero from "@/components/Hero";
import DashboardStats from "@/components/DashboardStats";
import MarketOverview from "@/components/MarketOverview";
import Footer from "@/components/Footer";

export default function Home() {
  return (
      <main className="min-h-screen bg-black text-white pb-24">
            <Hero />
                  <DashboardStats />
                        <MarketOverview />
                              <Footer />
                                  </main>
                                    );
                                    }