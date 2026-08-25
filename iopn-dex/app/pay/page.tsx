"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import {
  formatUnits,
  isAddress,
  parseEther,
  parseUnits,
} from "viem";

import { io } from "socket.io-client";

import {
  Wallet,
  Send,
  CreditCard,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  ChevronDown,
  Download,
  ScanLine,
} from "lucide-react";

import { TOKENS } from "@/lib/tokens";

import ReceiveModal from "./components/ReceiveModal";
import VirtualCard from "./components/VirtualCard";
import TransactionHistory from "./components/TransactionHistory";
import Scanner from "./components/Scanner";


/* =========================================================
   SOCKET
========================================================= */

const socket = io("https://iopndex.onrender.com", {
  transports: ["websocket"],
});


/* =========================================================
   ERC20 TRANSFER ABI
========================================================= */

const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const;


/* =========================================================
   FORMAT BALANCE
========================================================= */

function formatBalance(value: any) {
  if (!value) {
    return "0.00";
  }

  const formatted = Number(value.formatted || 0);

  if (!Number.isFinite(formatted)) {
    return "0.00";
  }

  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}


/* =========================================================
   SHORT ADDRESS
========================================================= */

function shortAddress(address?: string) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}


/* =========================================================
   PAGE
========================================================= */

export default function PayPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const {
    data: walletClient,
  } = useWalletClient();

  const publicClient =
    usePublicClient();


  /* =======================================================
     STATES
  ======================================================= */

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [tokenSymbol, setTokenSymbol] =
    useState("OPN");

  const [txHash, setTxHash] =
    useState<`0x${string}` | null>(null);

  const [liveTxs, setLiveTxs] =
    useState<any[]>([]);

  const [copied, setCopied] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


  /* =======================================================
     MODALS
  ======================================================= */

  const [showScanner, setShowScanner] =
    useState(false);

  const [showReceive, setShowReceive] =
    useState(false);

  const [showCard, setShowCard] =
    useState(false);


  /* =======================================================
     SEND FORM REF
  ======================================================= */

  const sendFormRef =
    useRef<HTMLDivElement | null>(null);


  /* =======================================================
     TOKEN
  ======================================================= */

  const token = useMemo(
    () =>
      TOKENS.find(
        (t) =>
          t.symbol === tokenSymbol
      ),
    [tokenSymbol]
  );


  /* =======================================================
     TOKEN INFORMATION
  ======================================================= */

  const selectedTokenAddress =
    token?.address;

  const isNativeToken =
    token?.native === true ||
    tokenSymbol === "OPN";


  const tokenDecimals =
    token?.decimals ?? 18;


  /* =======================================================
     SELECTED TOKEN BALANCE
  ======================================================= */

  const {
    data: selectedBalance,
    refetch: refetchBalance,
  } = useBalance({
    address,
    token: isNativeToken
      ? undefined
      : selectedTokenAddress,
  });


  /* =======================================================
     SEND TRANSACTION
  ======================================================= */

  async function sendTx() {
    setErrorMessage("");
    setStatusMessage("");

    if (!isConnected || !address) {
      setErrorMessage(
        "Please connect your wallet first."
      );
      return;
    }

    if (!walletClient) {
      setErrorMessage(
        "Wallet client is unavailable. Please reconnect your wallet."
      );
      return;
    }

    if (!publicClient) {
      setErrorMessage(
        "Blockchain client is unavailable."
      );
      return;
    }

    /* =====================================================
       RECIPIENT VALIDATION
    ===================================================== */

    const cleanRecipient =
      recipient.trim();

    if (!cleanRecipient) {
      setErrorMessage(
        "Please enter a recipient address."
      );
      return;
    }

    if (!isAddress(cleanRecipient)) {
      setErrorMessage(
        "Invalid recipient address."
      );
      return;
    }


    /* =====================================================
       AMOUNT VALIDATION
    ===================================================== */

    const cleanAmount =
      amount.trim();

    if (!cleanAmount) {
      setErrorMessage(
        "Please enter an amount."
      );
      return;
    }

    if (
      !/^(?:\d+\.?\d*|\.\d+)$/.test(
        cleanAmount
      )
    ) {
      setErrorMessage(
        "Invalid amount."
      );
      return;
    }

    if (
      Number(cleanAmount) <= 0
    ) {
      setErrorMessage(
        "Amount must be greater than zero."
      );
      return;
    }


    /* =====================================================
       TOKEN CHECK
    ===================================================== */

    if (
      !isNativeToken &&
      !selectedTokenAddress
    ) {
      setErrorMessage(
        "Selected token address is unavailable."
      );
      return;
    }


    /* =====================================================
       PARSE AMOUNT
    ===================================================== */

    let amountBaseUnits: bigint;

    try {
      amountBaseUnits =
        parseUnits(
          cleanAmount,
          tokenDecimals
        );
    } catch {
      setErrorMessage(
        `Invalid amount for ${tokenSymbol}.`
      );
      return;
    }

    if (
      amountBaseUnits <= 0n
    ) {
      setErrorMessage(
        "Amount must be greater than zero."
      );
      return;
    }


    /* =====================================================
       BALANCE CHECK
    ===================================================== */

    if (
      selectedBalance?.value !== undefined &&
      amountBaseUnits >
        selectedBalance.value
    ) {
      const available =
        formatUnits(
          selectedBalance.value,
          tokenDecimals
        );

      setErrorMessage(
        `Insufficient ${tokenSymbol} balance. Available: ${available} ${tokenSymbol}.`
      );

      return;
    }


    /* =====================================================
       START
    ===================================================== */

    setSending(true);

    setStatusMessage(
      "Waiting for wallet confirmation..."
    );


    try {
      let hash: `0x${string}`;


      /* ===================================================
         NATIVE OPN TRANSFER
      =================================================== */

      if (isNativeToken) {
        hash =
          await walletClient.sendTransaction({
            account: address,
            chain: walletClient.chain,
            to:
              cleanRecipient as `0x${string}`,
            value:
              amountBaseUnits,
          });
      }


      /* ===================================================
         ERC20 TRANSFER
      =================================================== */

      else {
        hash =
          await walletClient.writeContract({
            account: address,
            chain: walletClient.chain,
            address:
              selectedTokenAddress as `0x${string}`,
            abi:
              ERC20_TRANSFER_ABI,
            functionName:
              "transfer",
            args: [
              cleanRecipient as `0x${string}`,
              amountBaseUnits,
            ],
          });
      }


      /* ===================================================
         WALLET ACCEPTED
      =================================================== */

      setTxHash(hash);

      setStatusMessage(
        "Transaction submitted. Waiting for blockchain confirmation..."
      );


      /* ===================================================
         WAIT FOR RECEIPT
      =================================================== */

      const receipt =
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });


      if (
        receipt.status !== "success"
      ) {
        throw new Error(
          "The blockchain rejected the transaction."
        );
      }


      /* ===================================================
         CONFIRMED
      =================================================== */

      setStatusMessage(
        "Transaction confirmed successfully."
      );


      /* ===================================================
         BACKEND RECORD
      =================================================== */

      try {
        await fetch(
          "https://iopndex.onrender.com/api/send",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              from: address,
              to: cleanRecipient,
              amount: cleanAmount,
              token: tokenSymbol,
              hash,
              chainId: 984,
              status: "confirmed",
              blockNumber:
                receipt.blockNumber
                  ? receipt.blockNumber.toString()
                  : null,
            }),
          }
        );
      } catch (backendError) {
        console.error(
          "Backend recording failed:",
          backendError
        );
      }


      /* ===================================================
         REFRESH BALANCE
      =================================================== */

      await refetchBalance();


      /* ===================================================
         RESET FORM
      =================================================== */

      setRecipient("");
      setAmount("");


      /* ===================================================
         NOTIFICATION
      =================================================== */

      showNotification(
        "Transaction Confirmed",
        `${cleanAmount} ${tokenSymbol} sent successfully`
      );

    } catch (err: any) {
      console.error(
        "Payment transaction error:",
        err
      );


      /* ===================================================
         WALLET REJECTION
      =================================================== */

      const message =
        err?.shortMessage ||
        err?.details ||
        err?.message ||
        "";


      if (
        message
          .toLowerCase()
          .includes("user rejected") ||
        message
          .toLowerCase()
          .includes("user denied") ||
        message
          .toLowerCase()
          .includes("rejected")
      ) {
        setErrorMessage(
          "Transaction was rejected in your wallet."
        );
      }

      /* ===================================================
         INSUFFICIENT FUNDS
      =================================================== */

      else if (
        message
          .toLowerCase()
          .includes("insufficient funds")
      ) {
        setErrorMessage(
          `Insufficient funds to send ${tokenSymbol} and pay network gas.`
        );
      }

      /* ===================================================
         GENERIC FAILURE
      =================================================== */

      else {
        setErrorMessage(
          message ||
          "Transaction failed. Please try again."
        );
      }

      setStatusMessage("");

    } finally {
      setSending(false);
    }
  }


  /* =========================================================
     MAX
  ========================================================= */

  function setMaxAmount() {
    if (!selectedBalance) {
      return;
    }

    /*
     * For native OPN, don't blindly use the full balance
     * because gas must also be paid in OPN.
     */

    if (isNativeToken) {
      const balance =
        selectedBalance.value;

      const gasReserve =
        parseEther("0.001");

      if (
        balance <= gasReserve
      ) {
        setAmount("0");
        return;
      }

      setAmount(
        formatUnits(
          balance - gasReserve,
          18
        )
      );

      return;
    }


    /* =====================================================
       ERC20 MAX
    ===================================================== */

    setAmount(
      formatUnits(
        selectedBalance.value,
        tokenDecimals
      )
    );
  }


  /* =========================================================
     SCROLL TO SEND
  ========================================================= */

  function openSendForm() {
    sendFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }


  /* =========================================================
     COPY ADDRESS
  ========================================================= */

  async function copyAddress() {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1600
      );
    } catch (error) {
      console.error(error);
    }
  }


  /* =========================================================
     SOCKET EVENTS
  ========================================================= */

  useEffect(() => {
    socket.on(
      "connect",
      () => {
        console.log(
          "Socket connected:",
          socket.id
        );
      }
    );


    socket.on(
      "newTx",
      (tx) => {
        setLiveTxs(
          (prev) => [
            tx,
            ...prev,
          ]
        );

        showNotification(
          "💸 New Transaction",
          `${tx.amount} ${tx.token} sent`
        );
      }
    );


    socket.on(
      "txConfirmed",
      (data) => {
        setLiveTxs(
          (prev) =>
            prev.map(
              (tx) =>
                tx.hash === data.hash
                  ? {
                      ...tx,
                      status:
                        "confirmed",
                    }
                  : tx
            )
        );

        showNotification(
          "✅ Transaction Confirmed",
          "Your transaction is now confirmed"
        );
      }
    );


    return () => {
      socket.off("connect");
      socket.off("newTx");
      socket.off("txConfirmed");
    };
  }, []);


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);


  /* =========================================================
     PAYMENT URL
  ========================================================= */

  useEffect(() => {
    const url =
      window.location.href;

    if (
      url.includes(
        "iopndex://pay/"
      )
    ) {
      const addr =
        url.replace(
          "iopndex://pay/",
          ""
        );

      if (isAddress(addr)) {
        setRecipient(addr);
      }
    }
  }, []);


  /* =========================================================
     NOTIFICATION HELPER
  ========================================================= */

  function showNotification(
    title: string,
    body: string
  ) {
    if (
      "Notification" in window &&
      Notification.permission ===
        "granted"
    ) {
      new Notification(
        title,
        {
          body,
          icon: "/icon.png",
        }
      );
    }
  }


  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#02050B]
        pb-28
        text-white
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            left-[-100px]
            top-[120px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            right-[-140px]
            top-[420px]
            h-[380px]
            w-[380px]
            rounded-full
            bg-violet-600/[0.08]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            bottom-[-160px]
            left-[15%]
            h-[360px]
            w-[360px]
            rounded-full
            bg-blue-600/[0.06]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />

      </div>


      <div
        className="
          relative
          mx-auto
          w-full
          max-w-xl
          px-4
          pt-5
          sm:px-5
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-cyan-400/20
                bg-gradient-to-br
                from-cyan-400/15
                to-violet-500/15
              "
            >

              <Send
                size={20}
                className="text-cyan-300"
              />

            </div>

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <h1
                  className="
                    text-[25px]
                    font-black
                    tracking-tight
                  "
                >
                  IOPn Pay
                </h1>

                <Sparkles
                  size={15}
                  className="text-cyan-300"
                />

              </div>

              <p
                className="
                  text-xs
                  text-white/35
                "
              >
                Your Web3 payment hub
              </p>

            </div>

          </div>


          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.025]
            "
          >

            <Activity
              size={19}
              className="text-white/45"
            />

          </div>

        </header>


        {/* =================================================
            MAIN ASSET CARD
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-cyan-400/20
            bg-gradient-to-br
            from-[#0B1420]
            via-[#080C15]
            to-[#111021]
            p-4
          "
        >

          <div
            className="
              absolute
              right-[-80px]
              top-[-100px]
              h-48
              w-48
              rounded-full
              bg-violet-500/[0.10]
              blur-[80px]
            "
          />

          <div
            className="
              relative
              flex
              items-start
              justify-between
              gap-3
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-white/35
                "
              >
                Payment Asset
              </p>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-cyan-400
                    to-violet-600
                    text-lg
                    font-black
                  "
                >
                  {tokenSymbol.slice(0, 1)}
                </div>

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >

                    <span
                      className="
                        text-xl
                        font-black
                      "
                    >
                      {tokenSymbol}
                    </span>

                    <ChevronDown
                      size={16}
                      className="text-white/35"
                    />

                  </div>

                  <span
                    className="
                      mt-1
                      inline-flex
                      rounded-full
                      bg-violet-500/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-violet-300
                    "
                  >
                    OPN Testnet
                  </span>

                </div>

              </div>

            </div>


            <div className="text-right">

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-white/45
                "
              >
                Available Balance
              </span>

              <div
                className="
                  mt-2
                  flex
                  items-baseline
                  justify-end
                  gap-1.5
                "
              >

                <span
                  className="
                    text-3xl
                    font-black
                  "
                >
                  {formatBalance(
                    selectedBalance
                  )}
                </span>

              </div>

              <span
                className="
                  text-sm
                  font-bold
                  text-cyan-300
                "
              >
                {tokenSymbol}
              </span>

            </div>

          </div>


          {/* =================================================
              TOKEN CHIPS
          ================================================= */}

          <div
            className="
              mt-5
              overflow-x-auto
              pb-1
              scrollbar-none
            "
          >

            <div
              className="
                flex
                min-w-max
                gap-2
              "
            >

              {TOKENS.map(
                (item) => {

                  const active =
                    item.symbol ===
                    tokenSymbol;

                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => {
                        setTokenSymbol(
                          item.symbol
                        );
                        setErrorMessage("");
                        setStatusMessage("");
                      }}
                      className={`
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-3
                        py-2
                        text-xs
                        font-bold
                        transition
                        ${
                          active
                            ? "border-violet-400/70 bg-violet-500/15 text-white"
                            : "border-white/[0.07] bg-white/[0.025] text-white/55"
                        }
                      `}
                    >

                      <span
                        className="
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-white/10
                          text-[8px]
                          font-black
                        "
                      >
                        {item.symbol.slice(0, 1)}
                      </span>

                      {item.symbol}

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div
          className="
            mt-3
            grid
            grid-cols-4
            gap-2
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowReceive(true)
            }
            className="
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]
            "
          >

            <Download
              size={18}
              className="text-cyan-300"
            />

            <span
              className="
                text-[10px]
                font-bold
                text-white/60
              "
            >
              Receive
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              setShowScanner(true)
            }
            className="
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]
            "
          >

            <ScanLine
              size={18}
              className="text-violet-300"
            />

            <span
              className="
                text-[10px]
                font-bold
                text-white/60
              "
            >
              Scan
            </span>

          </button>


          <button
            type="button"
            onClick={openSendForm}
            className="
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.06]
            "
          >

            <ArrowUpRight
              size={19}
              className="text-cyan-300"
            />

            <span
              className="
                text-[10px]
                font-bold
                text-white/75
              "
            >
              Send
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              setShowCard(true)
            }
            className="
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]
            "
          >

            <CreditCard
              size={18}
              className="text-violet-300"
            />

            <span
              className="
                text-[10px]
                font-bold
                text-white/60
              "
            >
              Card
            </span>

          </button>

        </div>


        {/* =================================================
            SEND PAYMENT
        ================================================= */}

        <section
          ref={sendFormRef}
          className="
            mt-4
            scroll-mt-5
            rounded-[28px]
            border
            border-violet-400/15
            bg-gradient-to-br
            from-[#0A101A]
            via-[#080C14]
            to-[#0C0B17]
            p-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                "
              >

                <Send
                  size={18}
                  className="text-cyan-300"
                />

              </div>

              <div>

                <p
                  className="
                    text-base
                    font-black
                    uppercase
                  "
                >
                  Send Payment
                </p>

                <p
                  className="
                    text-[10px]
                    text-white/35
                  "
                >
                  Fast blockchain payment
                </p>

              </div>

            </div>

            <span
              className="
                rounded-full
                bg-violet-400/[0.07]
                px-3
                py-1.5
                text-[10px]
                font-bold
                text-violet-300
              "
            >
              {tokenSymbol}
            </span>

          </div>


          {/* AVAILABLE */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.02]
              px-3
              py-2.5
            "
          >

            <span
              className="
                text-[10px]
                text-white/35
              "
            >
              Available
            </span>

            <span
              className="
                text-xs
                font-bold
                text-cyan-300
              "
            >
              {formatBalance(
                selectedBalance
              )}{" "}
              {tokenSymbol}
            </span>

          </div>


          {/* RECIPIENT */}

          <div className="mt-4">

            <label
              className="
                text-xs
                font-semibold
                text-white/55
              "
            >
              Recipient Address
            </label>

            <div
              className="
                mt-2
                flex
                items-center
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/20
                px-4
              "
            >

              <input
                value={recipient}
                onChange={(e) =>
                  setRecipient(
                    e.target.value
                  )
                }
                placeholder="0x..."
                disabled={sending}
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/20
                "
              />

              <button
                type="button"
                disabled={sending}
                onClick={() =>
                  setRecipient(
                    address || ""
                  )
                }
                className="
                  rounded-xl
                  p-2
                  text-white/25
                  hover:text-cyan-300
                "
              >

                <Wallet
                  size={17}
                />

              </button>

            </div>

          </div>


          {/* AMOUNT */}

          <div className="mt-4">

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <label
                className="
                  text-xs
                  font-semibold
                  text-white/55
                "
              >
                Amount
              </label>

              <button
                type="button"
                disabled={sending}
                onClick={setMaxAmount}
                className="
                  text-xs
                  font-black
                  text-violet-300
                "
              >
                MAX
              </button>

            </div>

            <div
              className="
                mt-2
                flex
                items-center
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/20
                px-4
              "
            >

              <input
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                disabled={sending}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  py-4
                  text-lg
                  font-semibold
                  text-white
                  outline-none
                  placeholder:text-white/20
                "
              />

              <span
                className="
                  rounded-xl
                  bg-white/[0.04]
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-white/70
                "
              >
                {tokenSymbol}
              </span>

            </div>

          </div>


          {/* STATUS */}

          {statusMessage && (
            <div
              className="
                mt-3
                rounded-2xl
                border
                border-cyan-400/10
                bg-cyan-400/[0.04]
                px-3
                py-3
                text-xs
                text-cyan-300
              "
            >
              {statusMessage}
            </div>
          )}


          {/* ERROR */}

          {errorMessage && (
            <div
              className="
                mt-3
                rounded-2xl
                border
                border-red-400/15
                bg-red-400/[0.04]
                px-3
                py-3
                text-xs
                text-red-300
              "
            >
              {errorMessage}
            </div>
          )}


          {/* SEND BUTTON */}

          <button
            type="button"
            onClick={sendTx}
            disabled={sending}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-2xl
              bg-gradient-to-r
              from-cyan-300
              via-violet-300
              to-blue-500
              py-4
              text-sm
              font-black
              text-black
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {sending ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-black/30
                    border-t-black
                  "
                />

                Processing...

              </>
            ) : (
              <>
                <Send size={18} />

                Send Payment
              </>
            )}

          </button>

        </section>


        {/* =================================================
            SECURITY
        ================================================= */}

        <div
          className="
            mt-3
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-cyan-400/[0.08]
            bg-cyan-400/[0.025]
            px-4
            py-3
          "
        >

          <ShieldCheck
            size={18}
            className="text-cyan-300"
          />

          <div>

            <p
              className="
                text-[10px]
                font-bold
                text-white/60
              "
            >
              Secure wallet payment
            </p>

            <p
              className="
                text-[9px]
                text-white/30
              "
            >
              Transactions are signed directly by your wallet on IOPn Testnet.
            </p>

          </div>

        </div>


        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <section
          className="
            mt-4
            overflow-hidden
            rounded-[26px]
            border
            border-white/[0.08]
            bg-[#080D15]/80
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/[0.06]
              px-4
              py-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-2.5
              "
            >

              <Activity
                size={15}
                className="text-cyan-300"
              />

              <span
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-wide
                "
              >
                Recent Activity
              </span>

            </div>

            <ArrowUpRight
              size={16}
              className="text-violet-300"
            />

          </div>

          <div className="p-2">

            <TransactionHistory
              address={address}
              liveTxs={liveTxs}
            />

          </div>

        </section>


        {/* =================================================
            LAST TRANSACTION
        ================================================= */}

        {txHash && (
          <div
            className="
              mt-3
              rounded-2xl
              border
              border-emerald-400/15
              bg-emerald-400/[0.025]
              p-3
            "
          >

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <Zap
                size={14}
                className="text-emerald-400"
              />

              <span
                className="
                  text-[10px]
                  font-bold
                  text-emerald-400
                "
              >
                Confirmed Transaction
              </span>

            </div>

            <div
              className="
                mt-2
                flex
                items-center
                gap-2
                rounded-xl
                bg-black/20
                px-3
                py-2
              "
            >

              <p
                className="
                  min-w-0
                  flex-1
                  truncate
                  font-mono
                  text-[9px]
                  text-white/35
                "
              >
                {txHash}
              </p>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    txHash
                  );

                  setCopied(true);

                  setTimeout(
                    () => setCopied(false),
                    1500
                  );
                }}
                className="
                  shrink-0
                  text-white/30
                  hover:text-white
                "
              >

                {copied ? (
                  <Check size={13} />
                ) : (
                  <Copy size={13} />
                )}

              </button>

            </div>

          </div>
        )}

      </div>


      {/* =====================================================
          RECEIVE
      ===================================================== */}

      <ReceiveModal
        isOpen={showReceive}
        onClose={() =>
          setShowReceive(false)
        }
        address={address}
      />


      {/* =====================================================
          CARD
      ===================================================== */}

      <VirtualCard
        isOpen={showCard}
        onClose={() =>
          setShowCard(false)
        }
        balance={formatBalance(
          selectedBalance
        )}
        token={tokenSymbol}
        address={address}
      />


      {/* =====================================================
          SCANNER
      ===================================================== */}

      <Scanner
        isOpen={showScanner}
        onClose={() =>
          setShowScanner(false)
        }
        onScan={(addr: string) => {

          if (isAddress(addr)) {
            setRecipient(addr);
            setShowScanner(false);

            setTimeout(
              () => {
                openSendForm();
              },
              150
            );
          } else {
            setErrorMessage(
              "QR code does not contain a valid wallet address."
            );
          }

        }}
      />

    </main>
  );
}