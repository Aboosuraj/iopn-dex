export function startListener(io: any) {
      console.log("🚀 IOPN Listener Running...");

        // Fake blockchain listener (safe for deploy)
          setInterval(() => {
              const tx = {
                    hash: "0x" + Math.random().toString(16).substring(2),
                          status: "CONFIRMED",
                                timestamp: Date.now()
                                    };

                                        console.log("✅ TX CONFIRMED:", tx.hash);

                                            io.emit("tx:update", tx);
                                              }, 8000);
                                              }