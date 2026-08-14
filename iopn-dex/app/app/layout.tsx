import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <Header />

      <main className="pb-28 pt-20">
        {children}
      </main>

      <BottomNav />

    </div>
  );
}