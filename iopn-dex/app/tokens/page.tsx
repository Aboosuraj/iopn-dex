import Link from "next/link";

export default function TokensPage() {
  const tokens = [
      {
            name: "OPN",
                  price: "$0.00",
                        liquidity: "$0",
                            },
                                {
                                      name: "IDEX",
                                            price: "$0.00",
                                                  liquidity: "$0",
                                                      },
                                                          {
                                                                name: "DIO",
                                                                      price: "$0.00",
                                                                            liquidity: "$0",
                                                                                },
                                                                                    {
                                                                                          name: "DAA",
                                                                                                price: "$0.00",
                                                                                                      liquidity: "$0",
                                                                                                          },
                                                                                                            ];

                                                                                                              return (
                                                                                                                  <div className="p-6">
                                                                                                                        <h1 className="text-3xl font-bold mb-6">
                                                                                                                                Tokens
                                                                                                                                      </h1>

                                                                                                                                            <div className="border rounded-xl p-5">
                                                                                                                                                    <div className="grid grid-cols-3 font-bold border-b pb-3 mb-3">
                                                                                                                                                              <span>Token</span>
                                                                                                                                                                        <span>Price</span>
                                                                                                                                                                                  <span>Liquidity</span>
                                                                                                                                                                                          </div>

                                                                                                                                                                                                  {tokens.map((token) => (
                                                                                                                                                                                                            <div
                                                                                                                                                                                                                        key={token.name}
                                                                                                                                                                                                                                    className="grid grid-cols-3 py-3 border-b"
                                                                                                                                                                                                                                              >
                                                                                                                                                                                                                                                          <Link
                                                                                                                                                                                                                                                                        href={`/tokens/${token.name.toLowerCase()}`}
                                                                                                                                                                                                                                                                                      className="text-blue-500 hover:underline"
                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                {token.name}
                                                                                                                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                                                                                                                                        <span>{token.price}</span>

                                                                                                                                                                                                                                                                                                                                                    <span>{token.liquidity}</span>
                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                      ))}
                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                                                                                                                  }