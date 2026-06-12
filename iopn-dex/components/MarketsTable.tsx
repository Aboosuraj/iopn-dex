export default function MarketsTable() {
      const tokens = [
          {
                name: "IOPn",
                      symbol: "OPN",
                            price: "$0.00",
                                  change: "+0.00%",
                                        volume: "$0",
                                            },
                                                {
                                                      name: "DIO Token",
                                                            symbol: "DIO",
                                                                  price: "$0.00",
                                                                        change: "+0.00%",
                                                                              volume: "$0",
                                                                                  },
                                                                                    ];

                                                                                      return (
                                                                                          <div className="p-6">
                                                                                                <h1 className="text-3xl font-bold mb-6">
                                                                                                        Markets
                                                                                                              </h1>

                                                                                                                    {tokens.map((token) => (
                                                                                                                            <div
                                                                                                                                      key={token.symbol}
                                                                                                                                                className="border rounded-xl p-5 mb-3 shadow-sm"
                                                                                                                                                        >
                                                                                                                                                                  <div className="text-xl font-bold">
                                                                                                                                                                              {token.name}
                                                                                                                                                                                        </div>

                                                                                                                                                                                                  <div>Symbol: {token.symbol}</div>

                                                                                                                                                                                                            <div>Price: {token.price}</div>

                                                                                                                                                                                                                      <div>Change: {token.change}</div>

                                                                                                                                                                                                                                <div>Volume: {token.volume}</div>
                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                              ))}
                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                    }