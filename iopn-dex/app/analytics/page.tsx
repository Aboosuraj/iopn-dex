import LatestTransactions from "@/components/LatestTransactions";
import TopPairs from "@/components/TopPairs";
import TopTokens from "@/components/TopTokens";
import AnalyticsCards from "@/components/AnalyticsCards";

import { getTokenData } from "@/lib/tokenData";

export default async function AnalyticsPage() {
  const token1 = await getTokenData(
      "0xD5D72Ea6775D7618aFD4d8c42d2d8934638B75f9"
        );

          const token2 = await getTokenData(
              "0x3CC9C3D16a2cE9bEEb7f660cc696F804B4B3228f"
                );

                  return (
                      <div className="space-y-6 p-4">
                            {/* Live Blockchain Data */}
                                  <div className="rounded-xl border border-purple-500 p-4 bg-zinc-900">
                                          <h2 className="text-xl font-bold mb-4">
                                                    Live Blockchain Data
                                                            </h2>

                                                                    <div className="space-y-4">
                                                                              <div className="rounded-lg bg-zinc-800 p-4">
                                                                                          <h3 className="font-semibold text-lg">
                                                                                                        {token1.name}
                                                                                                                    </h3>
                                                                                                                                <p>Symbol: {token1.symbol}</p>
                                                                                                                                            <p>Total Supply: {token1.totalSupply}</p>
                                                                                                                                                        <p className="text-sm break-all">
                                                                                                                                                                      Contract: {token1.address}
                                                                                                                                                                                  </p>
                                                                                                                                                                                            </div>

                                                                                                                                                                                                      <div className="rounded-lg bg-zinc-800 p-4">
                                                                                                                                                                                                                  <h3 className="font-semibold text-lg">
                                                                                                                                                                                                                                {token2.name}
                                                                                                                                                                                                                                            </h3>
                                                                                                                                                                                                                                                        <p>Symbol: {token2.symbol}</p>
                                                                                                                                                                                                                                                                    <p>Total Supply: {token2.totalSupply}</p>
                                                                                                                                                                                                                                                                                <p className="text-sm break-all">
                                                                                                                                                                                                                                                                                              Contract: {token2.address}
                                                                                                                                                                                                                                                                                                          </p>
                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                        <TopTokens />
                                                                                                                                                                                                                                                                                                                                              <TopPairs />
                                                                                                                                                                                                                                                                                                                                                    <LatestTransactions />
                                                                                                                                                                                                                                                                                                                                                          <AnalyticsCards />
                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                }