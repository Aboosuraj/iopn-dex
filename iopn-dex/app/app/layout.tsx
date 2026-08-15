import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#050816] text-white">

      <Header />

      <main
        className="
          mx-auto
          w-full
          max-w-md
          px-4
          pt-[88px]
          pb-28
        "
      >
        {children}
      </main>

      <BottomNav />

    </div>
  );
}