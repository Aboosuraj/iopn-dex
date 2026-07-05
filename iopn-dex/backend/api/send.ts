export async function sendTransaction(data: {
      from: string;
        to: string;
          amount: string;
            token: string;
              hash: string;
                chainId: number;
                }) {
                  try {
                      console.log("New transaction received:");

                          console.log({
                                from: data.from,
                                      to: data.to,
                                            amount: data.amount,
                                                  token: data.token,
                                                        hash: data.hash,
                                                              chainId: data.chainId,
                                                                    time: new Date().toISOString(),
                                                                        });

                                                                            return {
                                                                                  success: true,
                                                                                        message: "Transaction recorded successfully",
                                                                                              transaction: {
                                                                                                      from: data.from,
                                                                                                              to: data.to,
                                                                                                                      amount: data.amount,
                                                                                                                              token: data.token,
                                                                                                                                      hash: data.hash,
                                                                                                                                              chainId: data.chainId,
                                                                                                                                                    },
                                                                                                                                                        };
                                                                                                                                                          } catch (err: any) {
                                                                                                                                                              return {
                                                                                                                                                                    success: false,
                                                                                                                                                                          error: err.message,
                                                                                                                                                                              };
                                                                                                                                                                                }
                                                                                                                                                                                }