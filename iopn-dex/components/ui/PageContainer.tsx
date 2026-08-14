import { ReactNode } from "react";

export default function PageContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        {children}
      </div>
    </main>
  );
}