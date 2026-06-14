import Link from "next/link";

export default function PairsPage() {
  const pairs = [
      {
            pair: "IDEX/OPN",
                  liquidity: "$0",
                        volume: "$0",
                              slug: "idex-opn",
                                  },
                                      {
                                            pair: "DIO/OPN",
                                                  liquidity: "$0",
                                                        volume: "$0",
                                                              slug: "dio-opn",
                                                                  },
                                                                      {
                                                                            pair: "DAA/OPN",
                                                                                  liquidity: "$0",
                                                                                        volume: "$0",
                                                                                              slug: "daa-opn",
                                                                                                  },
                                                                                                    ];

                                                                                                      return (
                                                                                                          <div className="p-6">
                                                                                                                <h1 className="text-3xl font-bold mb-6">
                                                                                                                        Trading Pairs
                                                                                                                              </h1>

                                                                                                                                    <div className="border rounded-xl p-5">
                                                                                                                                            <div className="grid grid-cols-3 font-bold border-b pb-3 mb-3">
                                                                                                                                                      <span>Pair</span>
                                                                                                                                                                <span>Liquidity</span>
                                                                                                                                                                          <span>24H Volume</span>
                                                                                                                                                                                  </div>

                                                                                                                                                                                          {pairs.map((pair) => (
                                                                                                                                                                                                    <div
                                                                                                                                                                                                                key={pair.pair}
                                                                                                                                                                                                                            className="grid grid-cols-3 py-3 border-b"
                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                  <Link
                                                                                                                                                                                                                                                                href={`/pairs/${pair.slug}`}
                                                                                                                                                                                                                                                                              className="text-blue-500 hover:underline"
                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                        {pair.pair}
                                                                                                                                                                                                                                                                                                                    </Link>

                                                                                                                                                                                                                                                                                                                                <span>{pair.liquidity}</span>

                                                                                                                                                                                                                                                                                                                                            <span>{pair.volume}</span>
                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                              ))}
                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                                                                                                          }