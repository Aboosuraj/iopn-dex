import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LiveStats from "@/components/landing/LiveStats";
import TrendingTokens from "@/components/landing/TrendingTokens";
import MarketsPreview from "@/components/landing/MarketsPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Roadmap from "@/components/landing/Roadmap";
import FAQ from "@/components/landing/FAQ";
import Community from "@/components/landing/Community";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      <Navbar />

      <Hero />

      <LiveStats />

      <TrendingTokens />

      <MarketsPreview />

      <HowItWorks />

      <Features />

      <Roadmap />

      <FAQ />

      <Community />

      <Footer />

    </main>
  );
}