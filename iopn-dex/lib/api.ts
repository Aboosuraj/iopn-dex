const API = "https://iopn-dex.onrender.com";

export async function getBalance(address: string) {
  const res = await fetch(`${API}/api/balance?address=${address}`);
    return res.json();
    }

    export async function getHistory(address: string) {
      const res = await fetch(`${API}/api/history?address=${address}`);
        return res.json();
        }

        export async function sendTx(
          to: string,
            amount: string,
              privateKey: string
              ) {
                const res = await fetch(`${API}/api/send`, {
                    method: "POST",
                        headers: {
                              "Content-Type": "application/json",
                                  },
                                      body: JSON.stringify({
                                            to,
                                                  amount,
                                                        privateKey,
                                                            }),
                                                              });

                                                                return await res.json();
                                                                }