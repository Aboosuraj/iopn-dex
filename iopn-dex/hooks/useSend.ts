"use client";

export function useSendTx() {
  async function sendTx(to: string, amount: string, privateKey: string) {
    const res = await fetch("https://iopndex.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        amount,
        privateKey,
      }),
    });

    return await res.json();
  }

  return { sendTx };
}