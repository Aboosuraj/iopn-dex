export default function LatestTransactions() {
      const txs = [
          {
                hash: "0x1234...abcd",
                      action: "Swap",
                          },
                              {
                                    hash: "0x5678...efgh",
                                          action: "Add Liquidity",
                                              },
                                                  {
                                                        hash: "0x9abc...ijkl",
                                                              action: "Transfer",
                                                                  },
                                                                    ];

                                                                      return (
                                                                          <div className="border rounded-xl p-5 mt-6">
                                                                                <h2 className="text-xl font-bold mb-4">
                                                                                        Latest Transactions
                                                                                              </h2>

                                                                                                    {txs.map((tx) => (
                                                                                                            <div
                                                                                                                      key={tx.hash}
                                                                                                                                className="flex justify-between py-2 border-b"
                                                                                                                                        >
                                                                                                                                                  <span>{tx.hash}</span>
                                                                                                                                                            <span>{tx.action}</span>
                                                                                                                                                                    </div>
                                                                                                                                                                          ))}
                                                                                                                                                                              </div>
                                                                                                                                                                                );
                                                                                                                                                                                }