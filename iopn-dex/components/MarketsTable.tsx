export default function MarketsTable() {
        const tokens = [
            {
                  name: "IOPN",
                        symbol: "OPN",
                              price: "$0.00",
                                    change: "+0.00%",
                                        },
                                            {
                                                  name: "DIO Token",
                                                        symbol: "DIO",
                                                              price: "$0.00",
                                                                    change: "+0.00%",
                                                                        },
                                                                          ];

                                                                            return (
                                                                                <div className="p-6">
                                                                                      <h1 className="text-3xl font-bold mb-6">
                                                                                              Markets
                                                                                                    </h1>

                                                                                                          <div className="space-y-3">
                                                                                                                  {tokens.map((token) => (
                                                                                                                            <div
                                                                                                                                        key={token.symbol}
                                                                                                                                                    className="border rounded-lg p-4"
                                                                                                                                                              >
                                                                                                                                                                          <div className="font-bold">
                                                                                                                                                                                        {token.name}
                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                <div>{token.symbol}</div>

                                                                                                                                                                                                                            <div>{token.price}</div>

                                                                                                                                                                                                                                        <div>{token.change}</div>
                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                          ))}
                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                      }