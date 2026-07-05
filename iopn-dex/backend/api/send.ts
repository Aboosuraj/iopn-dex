export async function sendTransaction(data: any) {
      try {
          return {
                success: true,
                      message: "Transaction recorded",
                            tx: {
                                    from: data.from,
                                            to: data.to,
                                                    amount: data.amount,
                                                            hash: data.hash,
                                                                    chainId: data.chainId,
                                                                            time: new Date().toISOString(),
                                                                                  },
                                                                                      };
                                                                                        } catch (err: any) {
                                                                                            return {
                                                                                                  success: false,
                                                                                                        error: err.message,
                                                                                                            };
                                                                                                              }
                                                                                                              }