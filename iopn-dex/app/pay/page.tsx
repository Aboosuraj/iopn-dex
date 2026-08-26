"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWriteContract,
} from "wagmi";

import {
  isAddress,
  parseEther,
  parseUnits,
} from "viem";

import {
  waitForTransactionReceipt,
} from "wagmi/actions";

import {
  io,
} from "socket.io-client";

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
  ChevronDown,
  Download,
  ScanLine,
} from "lucide-react";

import {
  config,
} from "@/lib/wagmi";

import {
  useTokens,
  type Token,
} from "@/hooks/useTokens";

import ReceiveModal from "./components/ReceiveModal";
import VirtualCard from "./components/VirtualCard";
import TransactionHistory from "./components/TransactionHistory";
import Scanner from "./components/Scanner";


/* =========================================================
   SOCKET
========================================================= */

const socket = io(
  "https://iopndex.onrender.com",
  {
    transports: ["websocket"],
  }
);


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

function formatBalance(
  value: any
) {
  if (!value) {
    return "0.00";
  }

  const formatted =
    Number(value.formatted);

  if (!Number.isFinite(formatted)) {
    return "0.00";
  }

  return formatted.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


/* =========================================================
   SHORT ADDRESS
========================================================= */

function shortAddress(
  address?: string
) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(
    0,
    6
  )}...${address.slice(-4)}`;
}


/* =========================================================
   PAGE
========================================================= */

export default function PayPage() {

  const {
    address,
    isConnected,
  } = useAccount();


  /* =======================================================
     TOKEN LIST
     IMPORTANT:
     useTokens() includes:
       - official tokens
       - factory discovered tokens
       - imported tokens
  ======================================================= */

  const {
    tokens,
    discovering,
  } = useTokens();


  /* =======================================================
     STATES
  ======================================================= */

  const [
    recipient,
    setRecipient,
  ] = useState("");


  const [
    amount,
    setAmount,
  ] = useState("");


  const [
    tokenSymbol,
    setTokenSymbol,
  ] = useState("OPN");


  const [
    txHash,
    setTxHash,
  ] = useState<string | null>(
    null
  );


  const [
    liveTxs,
    setLiveTxs,
  ] = useState<any[]>([]);


  const [
    copied,
    setCopied,
  ] = useState(false);


  const [
    sending,
    setSending,
  ] = useState(false);


  /* =======================================================
     MODALS
  ======================================================= */

  const [
    showScanner,
    setShowScanner,
  ] = useState(false);


  const [
    showReceive,
    setShowReceive,
  ] = useState(false);


  const [
    showCard,
    setShowCard,
  ] = useState(false);


  /* =======================================================
     SEND FORM REF
  ======================================================= */

  const sendFormRef =
    useRef<HTMLDivElement | null>(
      null
    );


  /* =======================================================
     SELECTED TOKEN
  ======================================================= */

  const token =
    useMemo<Token | undefined>(
      () =>
        tokens.find(
          (item) =>
            item.symbol ===
            tokenSymbol
        ),
      [
        tokens,
        tokenSymbol,
      ]
    );


  /* =======================================================
     NATIVE TOKEN DETECTION
  ======================================================= */

  const isNativeToken =
    Boolean(
      token?.native
    ) ||
    tokenSymbol === "OPN";


  /* =======================================================
     SELECTED TOKEN ADDRESS
  ======================================================= */

  const selectedTokenAddress =
    token?.address;


  /* =======================================================
     SELECTED TOKEN BALANCE
  ======================================================= */

  const {
    data: selectedBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useBalance({

    address,

    token:
      isNativeToken
        ? undefined
        : selectedTokenAddress as
            `0x${string}` |
            undefined,

  });


  /* =======================================================
     NATIVE SEND
  ======================================================= */

  const {
    sendTransactionAsync,
  } = useSendTransaction();


  /* =======================================================
     ERC20 SEND
  ======================================================= */

  const {
    writeContractAsync,
    isPending: contractPending,
  } = useWriteContract();


  /* =======================================================
     SEND TRANSACTION
  ======================================================= */

  async function sendTx() {

    if (sending) {
      return;
    }


    /* =====================================================
       WALLET
    ===================================================== */

    if (
      !isConnected ||
      !address
    ) {

      alert(
        "Connect wallet first"
      );

      return;
    }


    /* =====================================================
       TOKEN
    ===================================================== */

    if (!token) {

      alert(
        "Please select a token"
      );

      return;
    }


    /* =====================================================
       RECIPIENT
    ===================================================== */

    const cleanRecipient =
      recipient.trim();


    if (
      !cleanRecipient ||
      !isAddress(cleanRecipient)
    ) {

      alert(
        "Enter a valid recipient address"
      );

      return;
    }


    /* =====================================================
       AMOUNT
    ===================================================== */

    const cleanAmount =
      amount.trim();


    if (!cleanAmount) {

      alert(
        "Enter an amount"
      );

      return;
    }


    let parsedAmount: bigint;


    try {

      parsedAmount =
        parseUnits(
          cleanAmount,
          token.decimals
        );

    } catch {

      alert(
        "Invalid amount"
      );

      return;
    }


    if (
      parsedAmount <= 0n
    ) {

      alert(
        "Amount must be greater than zero"
      );

      return;
    }


    /* =====================================================
       BALANCE CHECK
    ===================================================== */

    if (
      selectedBalance?.value !==
        undefined &&
      parsedAmount >
        selectedBalance.value
    ) {

      alert(
        `Insufficient ${token.symbol} balance`
      );

      return;
    }


    /* =====================================================
       START
    ===================================================== */

    setSending(true);


    try {

      let hash:
        `0x${string}`;


      /* ===================================================
         NATIVE OPN TRANSFER
      =================================================== */

      if (
        isNativeToken
      ) {

        /*
         * Native OPN transfer.
         *
         * This opens the wallet's normal
         * native transaction confirmation.
         */

        hash =
          await sendTransactionAsync({

            to:
              cleanRecipient as
                `0x${string}`,

            value:
              parsedAmount,

          });

      }


      /* ===================================================
         ERC20 TRANSFER
      =================================================== */

      else {

        /*
         * ERC20 transfer.
         *
         * IMPORTANT:
         * A normal token transfer does NOT need
         * approve().
         *
         * approve() is only required when another
         * contract will call transferFrom().
         */

        if (
          !selectedTokenAddress ||
          !isAddress(
            selectedTokenAddress
          )
        ) {

          throw new Error(
            "Selected token has an invalid contract address"
          );

        }


        hash =
          await writeContractAsync({

            address:
              selectedTokenAddress as
                `0x${string}`,

            abi:
              ERC20_TRANSFER_ABI,

            functionName:
              "transfer",

            args: [

              cleanRecipient as
                `0x${string}`,

              parsedAmount,

            ],

          });

      }


      /* ===================================================
         TRANSACTION HASH
      =================================================== */

      setTxHash(
        hash
      );


      /* ===================================================
         WAIT FOR CONFIRMATION
      =================================================== */

      await waitForTransactionReceipt(
        config,
        {
          hash,
        }
      );


      /* ===================================================
         BACKEND RECORD
      =================================================== */

      try {

        await fetch(
          "https://iopndex.onrender.com/api/send",
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                from:
                  address,

                to:
                  cleanRecipient,

                amount:
                  cleanAmount,

                token:
                  token.symbol,

                tokenAddress:
                  token.address,

                hash,

                chainId:
                  984,

                native:
                  isNativeToken,

              }),

          }
        );

      } catch (
        backendError
      ) {

        /*
         * Do not mark the blockchain transaction
         * as failed if only backend recording failed.
         */

        console.error(
          "Backend transaction recording failed:",
          backendError
        );

      }


      /* ===================================================
         RESET
      =================================================== */

      setRecipient("");
      setAmount("");


      await refetchBalance();


      /* ===================================================
         SUCCESS
      =================================================== */

      alert(
        `${token.symbol} sent successfully 🚀`
      );

    } catch (
      error: any
    ) {

      console.error(
        "Payment transaction failed:",
        error
      );


      /*
       * Wallet rejection
       */

      if (
        error?.code === 4001 ||
        error?.name ===
          "UserRejectedRequestError"
      ) {

        alert(
          "Transaction rejected in wallet"
        );

      } else {

        alert(
          error?.shortMessage ||
          error?.message ||
          "Transaction failed ❌"
        );

      }

    } finally {

      setSending(false);

    }

  }


  /* =========================================================
     MAX AMOUNT
  ========================================================= */

  function setMaxAmount() {

    if (
      !selectedBalance?.formatted
    ) {

      setAmount(
        "0"
      );

      return;
    }


    /*
     * Do not use Number(...).toFixed(2)
     * because that destroys precision for tokens.
     *
     * Keep the actual wallet balance.
     */

    setAmount(
      selectedBalance.formatted
    );

  }


  /* =========================================================
     SCROLL TO SEND
  ========================================================= */

  function openSendForm() {

    sendFormRef.current?.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start",
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


      setCopied(
        true
      );


      setTimeout(
        () =>
          setCopied(false),
        1600
      );

    } catch (
      error
    ) {

      console.error(
        error
      );

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
                tx.hash ===
                data.hash
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

      socket.off(
        "connect"
      );

      socket.off(
        "newTx"
      );

      socket.off(
        "txConfirmed"
      );

    };

  }, []);


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  useEffect(() => {

    if (
      "Notification" in window
    ) {

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


      if (
        isAddress(addr)
      ) {

        setRecipient(
          addr
        );

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
     SEND BUTTON STATE
  ========================================================= */

  const sendButtonLoading =
    sending ||
    contractPending;


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
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-cyan-400/20
                bg-gradient-to-br
                from-cyan-400/15
                to-violet-500/15
                shadow-[0_0_30px_rgba(34,211,238,0.08)]
              "
            >

              <Send
                size={20}
                className="
                  relative
                  text-cyan-300
                "
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
                  className="
                    text-cyan-300
                  "
                />

              </div>


              <p
                className="
                  mt-0.5
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
              shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
            "
          >

            <Activity
              size={19}
              className="
                text-white/45
              "
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
            shadow-[0_20px_70px_rgba(0,0,0,0.35)]
          "
        >

          <div
            className="
              pointer-events-none
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
              pointer-events-none
              absolute
              left-[-60px]
              bottom-[-100px]
              h-40
              w-40
              rounded-full
              bg-cyan-400/[0.08]
              blur-[70px]
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
                    shadow-[0_0_28px_rgba(34,211,238,0.18)]
                  "
                >

                  {tokenSymbol ===
                  "OPN"
                    ? "O"
                    : tokenSymbol ===
                      "WOPN"
                    ? "N"
                    : tokenSymbol.slice(
                        0,
                        1
                      )}

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
                      className="
                        text-white/35
                      "
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


            <div
              className="
                text-right
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-end
                  gap-2
                "
              >

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-violet-400
                    shadow-[0_0_10px_rgba(167,139,250,0.8)]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-white/45
                  "
                >
                  Available Balance
                </span>

              </div>


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
                    tracking-tight
                    sm:text-4xl
                  "
                >

                  {balanceLoading
                    ? "..."
                    : formatBalance(
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
              relative
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

              {tokens.map(
                (item) => {

                  const active =
                    item.symbol ===
                    tokenSymbol;

                  return (

                    <button
                      key={
                        item.address
                      }
                      type="button"
                      onClick={() =>
                        setTokenSymbol(
                          item.symbol
                        )
                      }
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
                        transition-all
                        active:scale-95
                        ${
                          active
                            ? "border-violet-400/70 bg-violet-500/15 text-white shadow-[0_0_18px_rgba(139,92,246,0.15)]"
                            : "border-white/[0.07] bg-white/[0.025] text-white/55 hover:border-white/15 hover:text-white/80"
                        }
                      `}
                    >

                      <span
                        className={`
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          text-[8px]
                          font-black
                          ${
                            active
                              ? "bg-gradient-to-br from-cyan-300 to-violet-500 text-black"
                              : "bg-white/10 text-white/70"
                          }
                        `}
                      >

                        {item.symbol.slice(
                          0,
                          1
                        )}

                      </span>


                      {item.symbol}


                      {item.imported && (

                        <span
                          className="
                            text-[8px]
                            text-cyan-300
                          "
                        >
                          IMPORTED
                        </span>

                      )}

                    </button>

                  );

                }
              )}

            </div>

          </div>


          {discovering && (

            <p
              className="
                relative
                mt-3
                text-[10px]
                text-white/30
              "
            >
              Updating token list...
            </p>

          )}

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
              group
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]/90
              px-2
              py-3
              transition-all
              hover:-translate-y-0.5
              hover:border-cyan-400/30
              hover:bg-cyan-400/[0.05]
              active:scale-[0.97]
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-cyan-400/10
                text-cyan-300
              "
            >
              <Download size={18} />
            </div>

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
              group
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]/90
              px-2
              py-3
              transition-all
              hover:-translate-y-0.5
              hover:border-violet-400/30
              hover:bg-violet-400/[0.05]
              active:scale-[0.97]
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-violet-400/10
                text-violet-300
              "
            >
              <ScanLine size={18} />
            </div>

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
            onClick={
              openSendForm
            }
            className="
              group
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-cyan-400/20
              bg-gradient-to-b
              from-cyan-400/[0.08]
              to-violet-500/[0.05]
              px-2
              py-3
              transition-all
              hover:-translate-y-0.5
              hover:border-cyan-300/40
              hover:shadow-[0_0_25px_rgba(34,211,238,0.10)]
              active:scale-[0.97]
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-cyan-400/15
                to-violet-500/15
                text-cyan-300
              "
            >
              <ArrowUpRight size={19} />
            </div>

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
              group
              flex
              min-h-[82px]
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/[0.08]
              bg-[#080D15]/90
              px-2
              py-3
              transition-all
              hover:-translate-y-0.5
              hover:border-violet-400/30
              hover:bg-violet-400/[0.05]
              active:scale-[0.97]
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-violet-400/10
                text-violet-300
              "
            >
              <CreditCard size={18} />
            </div>

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
            shadow-[0_20px_60px_rgba(0,0,0,0.30)]
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
                  text-cyan-300
                "
              >
                <Send size={18} />
              </div>

              <div>

                <p
                  className="
                    text-base
                    font-black
                    uppercase
                    tracking-wide
                  "
                >
                  Send Payment
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-white/35
                  "
                >
                  Fast blockchain payment
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-violet-400/15
                bg-violet-400/[0.07]
                px-3
                py-1.5
              "
            >

              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-cyan-300
                  to-violet-500
                  text-[8px]
                  font-black
                  text-black
                "
              >
                {tokenSymbol.slice(
                  0,
                  1
                )}
              </span>

              <span
                className="
                  text-[10px]
                  font-bold
                  text-violet-300
                "
              >
                {tokenSymbol}
              </span>

            </div>

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

              {balanceLoading
                ? "Loading..."
                : formatBalance(
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
                transition
                focus-within:border-cyan-400/30
                focus-within:ring-1
                focus-within:ring-cyan-400/10
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
                onClick={() =>
                  setRecipient(
                    address || ""
                  )
                }
                className="
                  rounded-xl
                  p-2
                  text-white/25
                  transition
                  hover:bg-white/5
                  hover:text-cyan-300
                "
                title="Use my address"
              >
                <Wallet size={17} />
              </button>

            </div>


            {recipient &&
              !isAddress(
                recipient.trim()
              ) && (

                <p
                  className="
                    mt-2
                    text-[10px]
                    font-semibold
                    text-red-400
                  "
                >
                  Invalid wallet address
                </p>

              )}

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
                onClick={
                  setMaxAmount
                }
                className="
                  text-xs
                  font-black
                  text-violet-300
                  transition
                  hover:text-violet-200
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
                transition
                focus-within:border-violet-400/30
                focus-within:ring-1
                focus-within:ring-violet-400/10
              "
            >

              <input
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
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


              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white/[0.04]
                  px-2.5
                  py-2
                "
              >

                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-cyan-300
                    to-violet-500
                    text-[8px]
                    font-black
                    text-black
                  "
                >
                  {tokenSymbol.slice(
                    0,
                    1
                  )}
                </span>

                <span
                  className="
                    text-xs
                    font-bold
                    text-white/70
                  "
                >
                  {tokenSymbol}
                </span>

              </div>

            </div>

          </div>


          {/* TRANSACTION TYPE */}

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.02]
              px-3
              py-2.5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-[10px]
                  text-white/35
                "
              >
                Transfer type
              </span>


              <span
                className="
                  text-[10px]
                  font-bold
                  text-cyan-300
                "
              >
                {isNativeToken
                  ? "Native OPN transfer"
                  : "ERC-20 token transfer"}
              </span>

            </div>


            {!isNativeToken && (

              <p
                className="
                  mt-1
                  text-[9px]
                  text-white/25
                "
              >
                Direct wallet transfer — no approval
                required.
              </p>

            )}

          </div>


          {/* SEND BUTTON */}

          <button
            type="button"
            onClick={sendTx}
            disabled={
              sendButtonLoading ||
              !isConnected ||
              !token ||
              !recipient ||
              !amount
            }
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
              shadow-[0_10px_35px_rgba(59,130,246,0.18)]
              transition-all
              hover:-translate-y-0.5
              hover:shadow-[0_15px_40px_rgba(139,92,246,0.25)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {sendButtonLoading ? (

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

                Confirming...

              </>

            ) : (

              <>
                <Send size={18} />

                Send {tokenSymbol}

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

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-400/10
            "
          >

            <ShieldCheck
              size={16}
              className="text-cyan-300"
            />

          </div>


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
                mt-0.5
                text-[9px]
                text-white/30
              "
            >
              Transaction signed by your wallet
              on IOPn Testnet.
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

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                "
              >

                <Activity
                  size={15}
                  className="text-cyan-300"
                />

              </div>


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

              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-400/10
                "
              >

                <Zap
                  size={14}
                  className="text-emerald-400"
                />

              </div>


              <span
                className="
                  text-[10px]
                  font-bold
                  text-emerald-400
                "
              >
                Last Transaction
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
                onClick={() => {

                  navigator.clipboard.writeText(
                    txHash
                  );

                  setCopied(
                    true
                  );

                  setTimeout(
                    () =>
                      setCopied(false),
                    1200
                  );

                }}
                className="
                  shrink-0
                  text-white/30
                  hover:text-white
                "
              >

                <Copy size={13} />

              </button>

            </div>


            {copied && (

              <p
                className="
                  mt-1
                  text-[9px]
                  text-emerald-400
                "
              >
                Transaction hash copied
              </p>

            )}

          </div>

        )}

      </div>


      {/* =====================================================
          RECEIVE MODAL
      ===================================================== */}

      <ReceiveModal
        isOpen={
          showReceive
        }
        onClose={() =>
          setShowReceive(
            false
          )
        }
        address={
          address
        }
      />


      {/* =====================================================
          VIRTUAL CARD
      ===================================================== */}

      <VirtualCard
        isOpen={
          showCard
        }
        onClose={() =>
          setShowCard(
            false
          )
        }
        balance={
          formatBalance(
            selectedBalance
          )
        }
        token={
          tokenSymbol
        }
        address={
          address
        }
      />


      {/* =====================================================
          SCANNER
      ===================================================== */}

      <Scanner
        isOpen={
          showScanner
        }
        onClose={() =>
          setShowScanner(
            false
          )
        }
        onScan={(addr: string) => {

          if (
            isAddress(addr)
          ) {

            setRecipient(
              addr
            );

          }

          setShowScanner(
            false
          );


          setTimeout(
            () => {
              openSendForm();
            },
            150
          );

        }}
      />

    </main>

  );

}