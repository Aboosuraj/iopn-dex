import LatestTransactions from "@/components/LatestTransactions";
import TopPairs from "@/components/TopPairs";
import TopTokens from "@/components/TopTokens";

import AnalyticsCards from "@/components/AnalyticsCards";

export default function AnalyticsPage() {
  return (
    <div>
      <TopTokens />
      <TopPairs />
      <LatestTransactions />
      <AnalyticsCards />
    </div>
  );
}