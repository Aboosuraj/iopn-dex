"use client";

export function useSendTx() {
  async function sendTx(to: string, amount: string, privateKey: string) {
    const res = await fetch("http://localhost:4000/api/send", {
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