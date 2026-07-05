const API = "https://iopndex.onrender.com";

export async function getBalance(address: string) {
  const res = await fetch(`${API}/api/balance?address=${address}`);
    return res.json();
    }

    export async function getHistory(address: string) {
      const res = await fetch(`${API}/api/history?address=${address}`);
        return res.json();
        }

        /* FIXED SIGNATURE (THIS FIXES YOUR ERROR) */
        export async function sendTx(
          from: string,
            to: string,
              amount: string,
                token: string,
                  hash: string,
                    chainId: number
                    ) {
                      const res = await fetch(`${API}/api/send`, {
                          method: "POST",
                              headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                        from,
                                              to,
                                                    amount,
                                                          token,
                                                                hash,
                                                                      chainId,
                                                                          }),
                                                                            });

                                                                              return res.json();
                                                                              }