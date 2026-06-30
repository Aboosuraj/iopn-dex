"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { QRCodeSVG } from "qrcode.react";

import { TOKENS } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/erc20";

type Token = (typeof TOKENS)[number];

type ActivityItem = {
  id: string;
  type: "sent" | "received" | "card" | "scan";
  title: string;
  subtitle: string;
  amount?: string;
  status: "Completed" | "Pending" | "Ready";
};

export default function PayPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [activeTab, setActiveTab] = useState<"pay" | "receive" | "scan" | "card">("pay");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState("OPN");
  const [note, setNote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // scanner / UI
  const [scanResult, setScanResult] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  // virtual card UI state
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [cardCreated, setCardCreated] = useState(false);

  // payment history UI only
  const [activity, setActivity] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "received",
      title: "Received payment",
      subtitle: "Wallet QR receive",
      amount: "+24.50 OPN",
      status: "Completed",
    },
    {
      id: "2",
      type: "card",
      title: "Virtual card module",
      subtitle: "Ready for testnet activation",
      status: "Ready",
    },
    {
      id: "3",
      type: "scan",
      title: "QR payment scanner",
      subtitle: "Camera / QR flow ready for hookup",
      status: "Ready",
    },
  ]);

  const selectedToken = useMemo(
    () => TOKENS.find((t) => t.symbol === selectedTokenSymbol) ?? TOKENS[0],
    [selectedTokenSymbol]
  );

  const { data: nativeBalance } = useBalance({
    address,
  });

  const { data: tokenBalanceData } = useReadContract({
    address:
      !selectedToken.native && address
        ? (selectedToken.address as `0x${string}`)
        : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args:
      address && !selectedToken.native ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !selectedToken.native,
    },
  });

  const tokenBalance = useMemo(() => {
    if (!isConnected) return "0";

    if (selectedToken.native) {
      return nativeBalance?.formatted ?? "0";
    }

    if (!tokenBalanceData) return "0";

    return formatUnits(tokenBalanceData as bigint, selectedToken.decimals);
  }, [
    isConnected,
    selectedToken.native,
    selectedToken.decimals,
    nativeBalance,
    tokenBalanceData,
  ]);

  const amountParsed =
    amount && Number(amount) > 0
      ? parseUnits(amount, selectedToken.decimals)
      : undefined;

  const canSend =
    isConnected &&
    !!recipient &&
    recipient.startsWith("0x") &&
    recipient.length === 42 &&
    !!amount &&
    Number(amount) > 0 &&
    !!amountParsed;

  const {
    sendTransaction,
    data: nativeTxHash,
    isPending: isSendingNative,
  } = useSendTransaction();

  const {
    writeContract,
    data: tokenTxHash,
    isPending: isSendingToken,
  } = useWriteContract();

  const currentTxHash = nativeTxHash || tokenTxHash;

  const { isLoading: txLoading, isSuccess: txSuccess } =
    useWaitForTransactionReceipt({
      hash: currentTxHash,
    });

  useEffect(() => {
    if (txSuccess && currentTxHash) {
      setStatusMessage("Payment confirmed successfully.");

      const amountLabel = `${amount || "0"} ${selectedToken.symbol}`;
      setActivity((prev) => [
        {
          id: Date.now().toString(),
          type: "sent",
          title: "Payment sent",
          subtitle: recipient,
          amount: `-${amountLabel}`,
          status: "Completed",
        },
        ...prev,
      ]);

      setAmount("");
      setNote("");
    }
  }, [txSuccess, currentTxHash, amount, selectedToken.symbol, recipient]);

  async function handleSendPayment() {
    if (!canSend || !amountParsed) return;

    try {
      setStatusMessage("");

      // Native OPN payment
      if (selectedToken.native) {
        sendTransaction({
          to: recipient as `0x${string}`,
          value: amountParsed,
        });
        return;
      }

      // ERC20 payment
      writeContract({
        address: selectedToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, amountParsed],
      });
    } catch {
      setStatusMessage("Payment failed. Please try again.");
    }
  }

  function handleMax() {
    if (!tokenBalance || Number(tokenBalance) <= 0) return;

    const formatted = Number(tokenBalance).toFixed(
      selectedToken.decimals > 6 ? 6 : selectedToken.decimals
    );
    setAmount(formatted);
  }

  async function handleCopyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function useScannedValue() {
    if (!scanResult) return;

    setRecipient(scanResult.trim());
    setActiveTab("pay");

    setActivity((prev) => [
      {
        id: Date.now().toString(),
        type: "scan",
        title: "QR scanned",
        subtitle: scanResult.trim(),
        status: "Completed",
      },
      ...prev,
    ]);
  }

  async function handleCreateVirtualCard() {
    setIsCreatingCard(true);
    setStatusMessage("");

    setTimeout(() => {
      setIsCreatingCard(false);
      setCardCreated(true);
      setStatusMessage(
        "Virtual card created in UI mode. Hook real card backend/contract next."
      );

      setActivity((prev) => [
        {
          id: Date.now().toString(),
          type: "card",
          title: "Virtual card created",
          subtitle: "IOPn Testnet virtual card",
          status: "Completed",
        },
        ...prev,
      ]);
    }, 1800);
  }

  const walletShort =
    address && address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address ?? "Not connected";

  const paymentPending = isSendingNative || isSendingToken || txLoading;

  function getActivityBadgeColor(status: ActivityItem["status"]) {
    if (status === "Completed") {
      return "border-green-400/20 bg-green-500/10 text-green-300";
    }
    if (status === "Pending") {
      return "border-yellow-400/20 bg-yellow-500/10 text-yellow-300";
    }
    return "border-cyan-400/20 bg-cyan-500/10 text-cyan-300";
  }

  function getActivityIcon(type: ActivityItem["type"]) {
    if (type === "sent") return "↗";
    if (type === "received") return "↙";
    if (type === "card") return "💳";
    return "📷";
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#070b17] text-white">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                IOPn Pay • Testnet
              </div>

              <h1 className="bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                IOPn Pay Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-white/65 sm:text-base">
                Send crypto payments, receive with QR, scan wallet invoices, and
                manage your virtual card experience on the IOPN chain testnet.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!isConnected ? (
                <button
                  onClick={() =>
                    connectors[0] && connect({ connector: connectors[0] })
                  }
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"
                >
                  Connect Wallet
                </button>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                      Connected
                    </p>
                    <p className="mt-1 text-sm font-semibold text-cyan-300">
                      {walletShort}
                    </p>
                  </div>

                  <button
                    onClick={() => disconnect()}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-white/60">Wallet balance</p>
            <h2 className="mt-3 text-3xl font-extrabold text-cyan-300">
              {isConnected
                ? `${Number(tokenBalance || "0").toFixed(4)} ${selectedToken.symbol}`
                : "--"}
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Current selected payment token balance
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-white/60">Network</p>
            <h2 className="mt-3 text-3xl font-extrabold">IOPN Testnet</h2>
            <p className="mt-2 text-xs text-white/45">
              Optimized for wallet payments, QR receive and virtual card flow
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-sm text-white/60">Payment mode</p>
            <h2 className="mt-3 text-3xl font-extrabold text-fuchsia-300">
              Wallet + QR
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Native OPN and ERC20 transfer support
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* TABS */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: "pay", label: "Pay" },
                  { key: "receive", label: "Receive" },
                  { key: "scan", label: "Scan QR" },
                  { key: "card", label: "Virtual Card" },
                ].map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() =>
                        setActiveTab(tab.key as "pay" | "receive" | "scan" | "card")
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                        active
                          ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black"
                          : "bg-black/20 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAY PANEL */}
            {activeTab === "pay" && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold">Send Payment</h2>
                    <p className="mt-1 text-sm text-white/60">
                      Send native OPN or ERC20 tokens directly from your connected wallet.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
                      Balance
                    </p>
                    <p className="mt-1 text-sm font-bold text-cyan-300">
                      {Number(tokenBalance || "0").toFixed(4)} {selectedToken.symbol}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {/* recipient */}
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <label className="mb-2 block text-sm font-semibold text-white/75">
                      Recipient wallet
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/40"
                    />
                    <p className="mt-2 text-xs text-white/45">
                      Paste a wallet address or use the Scan QR tab to capture it.
                    </p>
                  </div>

                  {/* amount + token */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-white/75">
                          Amount
                        </label>
                        <button
                          onClick={handleMax}
                          type="button"
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300"
                        >
                          MAX
                        </button>
                      </div>

                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-3xl font-extrabold outline-none placeholder:text-white/20"
                      />
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <label className="mb-2 block text-sm font-semibold text-white/75">
                        Token
                      </label>
                      <select
                        value={selectedTokenSymbol}
                        onChange={(e) => setSelectedTokenSymbol(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-bold text-black outline-none"
                      >
                        {TOKENS.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-xs text-white/45">
                        {selectedToken.native
                          ? "Native chain payment"
                          : "ERC20 token transfer"}
                      </p>
                    </div>
                  </div>

                  {/* note */}
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <label className="mb-2 block text-sm font-semibold text-white/75">
                      Payment note (optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Invoice #102 / coffee / subscription..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/40"
                    />
                  </div>

                  {/* payment summary */}
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white/60">Payment method</span>
                        <span className="font-semibold">
                          {selectedToken.native ? "Native OPN Transfer" : "ERC20 Token Transfer"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white/60">Recipient</span>
                        <span className="max-w-[60%] break-all text-right text-white/85">
                          {recipient || "--"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white/60">Amount</span>
                        <span className="font-semibold">
                          {amount || "0"} {selectedToken.symbol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white/60">Network</span>
                        <span>IOPN Testnet</span>
                      </div>
                    </div>
                  </div>

                  {/* statuses */}
                  {statusMessage && (
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                      {statusMessage}
                    </div>
                  )}

                  {currentTxHash && (
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200 break-all">
                      Transaction submitted: {currentTxHash}
                    </div>
                  )}

                  {txLoading && (
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                      Payment pending confirmation...
                    </div>
                  )}

                  {txSuccess && (
                    <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                      Payment confirmed successfully.
                    </div>
                  )}

                  {/* action */}
                  {!isConnected ? (
                    <button
                      onClick={() =>
                        connectors[0] && connect({ connector: connectors[0] })
                      }
                      className="w-full rounded-3xl bg-white px-5 py-4 text-lg font-bold text-black transition hover:scale-[1.01]"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <button
                      onClick={handleSendPayment}
                      disabled={!canSend || paymentPending}
                      className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-4 text-lg font-bold text-black transition disabled:opacity-60"
                    >
                      {paymentPending ? "Sending Payment..." : "Send Payment"}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* RECEIVE PANEL */}
            {activeTab === "receive" && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold">Receive Payment</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Share your wallet address or QR code to receive funds on IOPN testnet.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="rounded-3xl bg-white p-4">
                      <div className="flex justify-center">
                        <QRCodeSVG
                          value={address || "Connect wallet to generate QR"}
                          size={220}
                          includeMargin
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-center text-sm text-white/60">
                      Scan to pay this wallet
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-semibold text-white/75">Wallet address</p>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="break-all text-sm text-white/85">
                          {address || "Connect wallet first"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={handleCopyAddress}
                          disabled={!address}
                          className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
                        >
                          {copied ? "Copied!" : "Copy Address"}
                        </button>

                        <button
                          onClick={() => setActiveTab("pay")}
                          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                        >
                          Go to Pay
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4">
                      <h3 className="text-lg font-bold">Receive tips</h3>
                      <ul className="mt-3 space-y-2 text-sm text-white/70">
                        <li>• Ask sender to verify the wallet address before sending.</li>
                        <li>• Use the QR code for faster wallet-to-wallet payments.</li>
                        <li>• You can receive native OPN and supported ERC20 tokens.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SCAN PANEL */}
            {activeTab === "scan" && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold">QR Scanner</h2>
                  <p className="mt-1 text-sm text-white/60">
                    UI-ready QR scanner section. Hook camera scanner library here next.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold">Scanner Console</h3>
                      <button
                        onClick={() => setScannerOpen((prev) => !prev)}
                        className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300"
                      >
                        {scannerOpen ? "Close Scanner" : "Open Scanner"}
                      </button>
                    </div>

                    <div className="rounded-3xl border border-dashed border-white/15 bg-[#0b1224] p-6">
                      {scannerOpen ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 text-4xl">
                            📷
                          </div>
                          <h4 className="text-xl font-bold">Camera scanner placeholder</h4>
                          <p className="mt-2 max-w-md text-sm text-white/60">
                            Add your QR camera package here later. For now, paste a scanned
                            wallet address below and send it into the Pay form.
                          </p>
                        </div>
                      ) : (
                        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl">
                            🔳
                          </div>
                          <h4 className="text-xl font-bold">Scanner closed</h4>
                          <p className="mt-2 text-sm text-white/60">
                            Open scanner or paste scanned data manually.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <label className="mb-2 block text-sm font-semibold text-white/75">
                        Scanned QR result / wallet address
                      </label>
                      <input
                        type="text"
                        value={scanResult}
                        onChange={(e) => setScanResult(e.target.value)}
                        placeholder="Paste scanned wallet address here..."
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                      />

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={useScannedValue}
                          disabled={!scanResult}
                          className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
                        >
                          Use in Pay Form
                        </button>

                        <button
                          onClick={() => {
                            setScanResult("");
                            setScannerOpen(false);
                          }}
                          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 p-5">
                      <h3 className="text-lg font-bold">Scanner flow</h3>
                      <div className="mt-4 space-y-3 text-sm text-white/70">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          1. Open camera scanner
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          2. Scan recipient wallet QR
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          3. Auto-fill address into Pay form
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          4. Confirm amount and send payment
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <h3 className="text-lg font-bold">Last scanned value</h3>
                      <p className="mt-3 break-all text-sm text-white/70">
                        {scanResult || "No scanned result yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* CARD PANEL */}
            {activeTab === "card" && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold">Virtual Card</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Beautiful virtual card UI for your IOPN Pay app. You can later connect
                    this button to a real card issuance backend or smart contract flow.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-5">
                    {/* card visual */}
                    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/25 via-[#111827] to-fuchsia-500/20 p-6 shadow-2xl">
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                              IOPN PAY CARD
                            </p>
                            <h3 className="mt-2 text-2xl font-extrabold">Virtual Testnet Card</h3>
                          </div>

                          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                            {cardCreated ? "Active" : "Ready"}
                          </div>
                        </div>

                        <div className="mt-10">
                          <p className="text-sm text-white/55">Card Number</p>
                          <p className="mt-2 text-2xl font-bold tracking-[0.2em]">
                            {cardCreated ? "5412 8890 1147 2098" : "•••• •••• •••• ••••"}
                          </p>
                        </div>

                        <div className="mt-8 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs text-white/55">Cardholder</p>
                            <p className="mt-1 text-sm font-bold">
                              {isConnected ? "IOPN USER" : "CONNECT WALLET"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-white/55">Expires</p>
                            <p className="mt-1 text-sm font-bold">
                              {cardCreated ? "12/29" : "--/--"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-white/55">CVV</p>
                            <p className="mt-1 text-sm font-bold">
                              {cardCreated ? "482" : "***"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* card features */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white/80">Chain linked</p>
                        <p className="mt-2 text-xs text-white/55">
                          Can be linked to IOPN wallet balance and spending limits.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white/80">Fast funding</p>
                        <p className="mt-2 text-xs text-white/55">
                          Fund from wallet, receive testnet rewards, or simulate card top-up.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-semibold text-white/80">Secure controls</p>
                        <p className="mt-2 text-xs text-white/55">
                          Freeze, regenerate, or cap spending when you add real backend logic.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                      <h3 className="text-lg font-bold">Card Actions</h3>
                      <p className="mt-2 text-sm text-white/60">
                        Create a virtual card UI now, then connect it to your real testnet card
                        minting or backend flow later.
                      </p>

                      <div className="mt-5 space-y-3">
                        <button
                          onClick={handleCreateVirtualCard}
                          disabled={isCreatingCard}
                          className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-4 text-sm font-bold text-black disabled:opacity-60"
                        >
                          {isCreatingCard
                            ? "Creating Virtual Card..."
                            : cardCreated
                            ? "Virtual Card Created"
                            : "Create Virtual Card"}
                        </button>

                        <button
                          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold text-white"
                          type="button"
                        >
                          Freeze Card
                        </button>

                        <button
                          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold text-white"
                          type="button"
                        >
                          View Card Activity
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-5">
                      <h3 className="text-lg font-bold">Card Status</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Mode</span>
                          <span>{cardCreated ? "Provisioned" : "UI Demo"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Network</span>
                          <span>IOPN Testnet</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Card funding</span>
                          <span>Wallet-based</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Status</span>
                          <span className="text-cyan-300">
                            {cardCreated ? "Created" : "Ready to create"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-6">
            {/* WALLET PANEL */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <h3 className="text-xl font-extrabold">Wallet Overview</h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Address
                  </p>
                  <p className="mt-2 break-all text-sm text-white/85">
                    {address || "Connect wallet to view your address"}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Selected token
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold">{selectedToken.symbol}</span>
                    <span className="text-cyan-300">
                      {Number(tokenBalance || "0").toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Wallet status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/80">
                    {isConnected ? "Connected and ready for payments" : "Not connected"}
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <h3 className="text-xl font-extrabold">Quick Actions</h3>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={() => setActiveTab("pay")}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-bold">Send payment</p>
                  <p className="mt-1 text-sm text-white/55">
                    Wallet to wallet transfer
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("receive")}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-bold">Receive with QR</p>
                  <p className="mt-1 text-sm text-white/55">
                    Show wallet QR for incoming payment
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("scan")}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-bold">Scan QR</p>
                  <p className="mt-1 text-sm text-white/55">
                    Capture recipient and auto-fill payment
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab("card")}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:bg-white/10"
                >
                  <p className="font-bold">Virtual card</p>
                  <p className="mt-1 text-sm text-white/55">
                    Create and manage testnet virtual card UI
                  </p>
                </button>
              </div>
            </div>

            {/* ACTIVITY */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold">Recent Activity</h3>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">
                  {activity.length} items
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg">
                        {getActivityIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold">{item.title}</p>
                            <p className="mt-1 break-all text-xs text-white/50">
                              {item.subtitle}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getActivityBadgeColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.amount && (
                          <p className="mt-3 text-sm font-bold text-cyan-300">
                            {item.amount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {activity.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/55">
                    No activity yet.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}