export default function TopTokens() {
      const tokens = [
          { name: "OPN", price: "$0.00", change: "+0.00%" },
              { name: "DIO", price: "$0.00", change: "+0.00%" },
                  { name: "DAA", price: "$0.00", change: "+0.00%" },
                    ];

                      return (
                          <div className="border rounded-xl p-5 mt-6">
                                <h2 className="text-xl font-bold mb-4">
                                        Top Tokens
                                              </h2>

                                                    {tokens.map((token) => (
                                                            <div
                                                                      key={token.name}
                                                                                className="flex justify-between py-2 border-b"
                                                                                        >
                                                                                                  <span>{token.name}</span>
                                                                                                            <span>{token.price}</span>
                                                                                                                      <span>{token.change}</span>
                                                                                                                              </div>
                                                                                                                                    ))}
                                                                                                                                        </div>
                                                                                                                                          );
                                                                                                                                          }