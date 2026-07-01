"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { io } from "socket.io-client";

import { TOKENS } from "@/lib/tokens";

/* ================= SOCKET ================= */
const socket = io("http://localhost:5000");

/* ================= UTIL ================= */
function formatBalance(value: any) {
  if (!value) return "0.00";
  const num = Number(value?.formatted || value?.toString?.() || 0);
  return num.toFixed(2);
}

/* ================= PAGE ================= */
export default function PayPage() {
  const { address } = useAccount();

  const [tokenSymbol, setTokenSymbol] = useState("OPN");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const [tab, setTab] = useState<"send" | "receive" | "scan">("send");

  const [liveTxs, setLiveTxs] = useState<any[]>([]);

  const token = useMemo(
    () => TOKENS.find((t) => t.symbol === tokenSymbol)!,
    [tokenSymbol]
  );

  /* ================= BALANCE ================= */
  const { data: balance } = useBalance({ address });

  /* ================= SEND TX (BACKEND ENGINE) ================= */
  async function sendTx() {
    if (!recipient || !amount || !address) return;

    try {
      const res = await fetch("http://localhost:5000/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: address,
          to: recipient,
          amount,
          token: tokenSymbol,
          chainId: 984,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAmount("");
        setRecipient("");
        alert("Transaction sent 🚀");
      } else {
        alert("Transaction failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  }

  /* ================= SOCKET REAL-TIME LISTENER ================= */
  useEffect(() => {
    socket.on("txConfirmed", (data) => {
      console.log("CONFIRMED:", data);

      setLiveTxs((prev) =>
        prev.map((tx) =>
          tx.hash === data.hash
            ? { ...tx, status: "confirmed" }
            : tx
        )
      );
    });

    socket.on("newTx", (tx) => {
      setLiveTxs((prev) => [tx, ...prev]);
    });

    return () => {
      socket.off("txConfirmed");
      socket.off("newTx");
    };
  }, []);

  /* ================= QR SCAN HANDLER ================= */
  function handleScan(value: string) {
    setRecipient(value);
    setTab("send");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">IOPN Exchange Pay</h1>
        <p className="text-white/60">
          Balance: {formatBalance(balance)} {tokenSymbol}
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab("send")} className="px-4 py-2 bg-white/10 rounded">
          Send
        </button>
        <button onClick={() => setTab("receive")} className="px-4 py-2 bg-white/10 rounded">
          Receive
        </button>
        <button onClick={() => setTab("scan")} className="px-4 py-2 bg-white/10 rounded">
          Scan
        </button>
      </div>

      {/* ================= SEND ================= */}
      {tab === "send" && (
        <div className="space-y-4">
          <input
            className="w-full p-3 bg-white/10 rounded"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <input
            className="w-full p-3 bg-white/10 rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={sendTx}
            className="w-full p-3 bg-green-500 text-black font-bold rounded"
          >
            Send Transaction
          </button>
        </div>
      )}

      {/* ================= SCAN ================= */}
      {tab === "scan" && (
        <div className="p-4 bg-white/5 rounded">
          <div className="h-40 bg-white/10 rounded flex items-center justify-center">
            QR Scanner Area
          </div>

          <button
            onClick={() => handleScan("0xDEMO_ADDRESS")}
            className="mt-4 w-full p-3 bg-blue-500 rounded"
          >
            Simulate Scan
          </button>
        </div>
      )}

      {/* ================= LIVE TX ================= */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-3">Live Transactions</h2>

        {liveTxs.length === 0 && (
          <p className="text-white/40">No transactions yet</p>
        )}

        {liveTxs.map((tx, i) => (
          <div key={i} className="p-3 border-b border-white/10">
            <p className="text-sm text-white/60">
              {tx.from} → {tx.to}
            </p>
            <p className="text-green-400">
              {tx.amount} OPN
            </p>
            <p className="text-xs text-white/40">
              Status: {tx.status || "pending"}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}