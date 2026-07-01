"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWriteContract,
} from "wagmi";

import { useScanner } from "@/hooks/useScanner";
import { parseUnits, formatEther } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { TOKENS } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/erc20";
import { useSocket } from "@/hooks/useSocket";
import { useBalance as useBackendBalance } from "@/hooks/useBalance";
import { useHistory } from "@/hooks/useHistory";

/* ================= UTIL ================= */
function formatBalance(value: any) {
  if (!value) return "0.00";
  return parseFloat(formatEther(value.value || value)).toFixed(2);
}

/* ================= QR SCANNER ================= */
function QRScanner({ onScan }: any) {
  useEffect(() => {
    let scanner: any;

    import("html5-qrcode").then((mod) => {
      const Html5QrcodeScanner = mod.Html5QrcodeScanner;

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render((text: string) => onScan(text), () => {});
    });

    return () => {
      if (scanner) scanner.clear();
    };
  }, [onScan]);

  return (
    <div className="w-full flex justify-center">
      <div id="qr-reader" className="rounded-2xl overflow-hidden" />
    </div>
  );
}

/* ================= WALLET APPROVAL MODAL ================= */
function ConfirmModal({ open, data, onCancel, onConfirm }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0b0f1a] border border-white/10 p-5">

        <h2 className="text-xl font-bold">Approve Transaction</h2>
        <p className="text-xs text-white/50 mt-1">
          This will be signed by your wallet
        </p>

        <div className="mt-4 space-y-2 text-sm text-white/70">
          <p><b>Token:</b> {data.token}</p>
          <p><b>Amount:</b> {data.amount}</p>
          <p className="break-all"><b>To:</b> {data.to}</p>
          <p><b>Gas:</b> {data.gas}</p>
          <p><b>Slippage:</b> {data.slippage}%</p>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="w-full py-3 bg-white/10 rounded-xl">
            Reject
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-bold rounded-xl"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function PayPage() {
  const { address, isConnected } = useAccount();

  const history = useHistory(address);
const socketTxs = useSocket(address);
const balance = useBackendBalance(address);
  const [tokenSymbol, setTokenSymbol] = useState("OPN");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { startScanner, stopScanner, isScanning } = useScanner(handleScan);

  const [tab, setTab] = useState<"send" | "receive" | "scan" | "card">("send");

  const [gas, setGas] = useState<"low" | "standard" | "fast">("standard");
  const [slippage, setSlippage] = useState(0.5);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cardActive, setCardActive] = useState(false);

  /* ================= TOKEN ================= */
  const token = useMemo(
    () => TOKENS.find((t) => t.symbol === tokenSymbol)!,
    [tokenSymbol]
  );

  /* ================= BALANCE ================= */
  const formattedBalance = formatBalance(balance);

  /* ================= TX ================= */
  const { sendTransaction } = useSendTransaction();
  const { writeContract } = useWriteContract();

  const parsedAmount =
    amount ? parseUnits(amount, token.decimals) : undefined;

  const canSend =
    isConnected &&
    recipient?.startsWith("0x") &&
    recipient.length === 42 &&
    Number(amount) > 0;

  function sendTx() {
    if (!parsedAmount) return;

    if (token.native) {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parsedAmount,
      });
    } else {
      writeContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, parsedAmount],
      });
    }
  }

  /* ================= QR SCAN ================= */
  function handleScan(value: string) {
    setRecipient(value);
    setTab("send");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070b17] to-black text-white p-4">

      {/* ================= HEADER ================= */}
      <div className="rounded-3xl p-5 bg-white/5 border border-white/10 backdrop-blur-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          IOPN Pay
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Payments • IOPn Chain Testnet
        </p>

        {/* BALANCE CARD */}
        <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/10">
          <p className="text-xs text-white/50">Wallet Balance</p>
          <h2 className="text-2xl font-bold text-cyan-300">
            {formattedBalance} OPN
          </h2>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {["send", "receive", "scan", "card"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`py-2 rounded-xl text-sm font-bold ${
              tab === t
                ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-black"
                : "bg-white/10"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= SEND ================= */}
      {tab === "send" && (
        <div className="mt-5 space-y-4">

          <select
            className="w-full p-3 rounded-xl bg-black border border-white/10"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          >
            {TOKENS.map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-xl bg-black border border-white/10 text-xl"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* GAS */}
          <div className="grid grid-cols-3 gap-2">
            {["low", "standard", "fast"].map((g) => (
              <button
                key={g}
                onClick={() => setGas(g as any)}
                className={`p-2 rounded-xl ${
                  gas === g ? "bg-green-400 text-black" : "bg-white/10"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* SLIPPAGE */}
          <div className="bg-white/5 p-3 rounded-xl">
            <p className="text-sm">Slippage: {slippage}%</p>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            disabled={!canSend}
            onClick={() => setConfirmOpen(true)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold disabled:opacity-40"
          >
            Send Payment
          </button>
        </div>
      )}

      {/* ================= RECEIVE (CENTER QR) ================= */}
      {tab === "receive" && (
        <div className="mt-10 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG value={address || ""} size={180} />
          </div>

          <p className="text-xs mt-4 break-all text-center text-white/60">
            {address}
          </p>
        </div>
      )}

      {/* ================= SCAN ================= */}
      {tab === "scan" && (
  <div className="mt-5 space-y-4">

    <div
      id="qr-reader"
      className="rounded-2xl overflow-hidden border border-white/10"
    />

    <button
      onClick={startScanner}
      className="w-full p-3 rounded-xl bg-green-500 text-black font-bold"
    >
      Start Scanner
    </button>

    <button
      onClick={stopScanner}
      className="w-full p-3 rounded-xl bg-red-500 text-white font-bold"
    >
      Stop Scanner
    </button>

    {isScanning && (
      <p className="text-center text-green-400">
        Scanner is running...
      </p>
    )}

  </div>
)}

      {/* ================= CARD ================= */}
      {tab === "card" && (
        <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/10">
          <h2 className="text-lg font-bold">Virtual Card</h2>
          <p className="text-xs text-white/60 mt-2">
            Web3 Payment Card System
          </p>

          <button
            onClick={() => setCardActive(!cardActive)}
            className="mt-4 w-full p-3 rounded-xl bg-black/40 border border-white/10"
          >
            {cardActive ? "Freeze Card" : "Activate Card"}
          </button>
        </div>
      )}

      {/* ================= CONFIRM ================= */}
      <ConfirmModal
        open={confirmOpen}
        data={{ token: tokenSymbol, amount, to: recipient, gas, slippage }}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          sendTx();
        }}
      />
    </main>
  );
}