"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { io } from "socket.io-client";

import {
  Wallet,
  Send,
  QrCode,
  CreditCard,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { TOKENS } from "@/lib/tokens";

import BalanceCard from "./components/BalanceCard";
import TokenSelector from "./components/TokenSelector";
import SendForm from "./components/SendForm";
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
   FORMAT BALANCE
========================================================= */

function formatBalance(value: any) {
  if (!value) {
    return "0.00";
  }

  return Number(value.formatted || 0).toFixed(2);
}


/* =========================================================
   PAGE
========================================================= */

export default function PayPage() {

  const {
    address,
    isConnected,
  } = useAccount();


  const [recipient, setRecipient] = useState("");

  const [amount, setAmount] = useState("");

  const [tokenSymbol, setTokenSymbol] = useState("OPN");

  const [txHash, setTxHash] =
    useState<string | null>(null);

  const [liveTxs, setLiveTxs] =
    useState<any[]>([]);


  /* MODALS */

  const [showScanner, setShowScanner] =
    useState(false);

  const [showReceive, setShowReceive] =
    useState(false);

  const [showCard, setShowCard] =
    useState(false);


  /* TOKEN */

  const token = useMemo(
    () =>
      TOKENS.find(
        (t) => t.symbol === tokenSymbol
      ),
    [tokenSymbol]
  );


  /* BALANCE */

  const {
    data: balance,
  } = useBalance({
    address,
  });


  /* SEND */

  const {
    sendTransactionAsync,
  } = useSendTransaction();


  /* =========================================================
     SEND TRANSACTION
  ========================================================= */

  async function sendTx() {

    if (!isConnected || !address) {

      alert("Connect wallet first");

      return;
    }


    if (!recipient || !amount) {

      alert("Missing fields");

      return;
    }


    try {

      /* WALLET TRANSACTION */

      const tx =
        await sendTransactionAsync({
          to: recipient as `0x${string}`,
          value: parseEther(amount),
        });


      setTxHash(tx);


      /* BACKEND RECORD */

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

            to: recipient,

            amount,

            token: tokenSymbol,

            hash: tx,

            chainId: 984,

          }),

        }
      );


      setRecipient("");

      setAmount("");


      alert("Transaction sent 🚀");

    } catch (err) {

      console.error(err);

      alert("Transaction failed ❌");

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


      setRecipient(addr);

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
        min-h-screen
        bg-[#050816]
        pb-28
        text-white
      "
    >

      {/* =====================================================
          BACKGROUND GLOW
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
            left-1/2
            top-0
            h-80
            w-80
            -translate-x-1/2
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />


        <div
          className="
            absolute
            bottom-20
            right-[-80px]
            h-72
            w-72
            rounded-full
            bg-purple-500/10
            blur-[120px]
          "
        />

      </div>


      <div
        className="
          mx-auto
          w-full
          max-w-xl
          px-4
          pt-6
        "
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-6
            flex
            items-center
            justify-between
          "
        >

          <div>

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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-cyan-400
                "
              >
                <Send size={18} />
              </div>


              <h1
                className="
                  text-2xl
                  font-black
                "
              >
                IOPn Pay
              </h1>

            </div>


            <p
              className="
                mt-1
                text-sm
                text-white/40
              "
            >
              Send and receive assets on IOPn
            </p>

          </div>


          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/50
            "
          >
            <Activity size={18} />
          </div>

        </div>


        {/* =================================================
            NETWORK STATUS
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-emerald-400/10
            bg-emerald-400/[0.04]
            px-4
            py-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-emerald-400
              "
            />

            <span
              className="
                text-xs
                font-semibold
                text-white/60
              "
            >
              OPN Testnet
            </span>

          </div>


          <span
            className="
              text-xs
              text-emerald-400
            "
          >
            Network Online
          </span>

        </div>


        {/* =================================================
            BALANCE CARD
        ================================================= */}

        <BalanceCard
          balance={formatBalance(balance)}
          token={tokenSymbol}
          address={address}
          onReceive={() =>
            setShowReceive(true)
          }
          onScanner={() =>
            setShowScanner(true)
          }
          onVirtualCard={() =>
            setShowCard(true)
          }
        />


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-3
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowReceive(true)
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              py-4
              transition
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.06]
            "
          >

            <QrCode
              size={20}
              className="text-cyan-400"
            />

            <span
              className="
                text-xs
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
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              py-4
              transition
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.06]
            "
          >

            <QrCode
              size={20}
              className="text-purple-400"
            />

            <span
              className="
                text-xs
                font-bold
                text-white/60
              "
            >
              Scan
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              setShowCard(true)
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              py-4
              transition
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.06]
            "
          >

            <CreditCard
              size={20}
              className="text-cyan-400"
            />

            <span
              className="
                text-xs
                font-bold
                text-white/60
              "
            >
              Card
            </span>

          </button>

        </div>


        {/* =================================================
            TOKEN SELECTOR
        ================================================= */}

        <section
          className="
            mt-5
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            p-4
            backdrop-blur-xl
          "
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <Wallet
              size={16}
              className="text-cyan-400"
            />

            <span
              className="
                text-sm
                font-bold
              "
            >
              Payment Token
            </span>

          </div>


          <TokenSelector
            value={tokenSymbol}
            onChange={setTokenSymbol}
          />

        </section>


        {/* =================================================
            SEND
        ================================================= */}

        <section className="mt-4">

          <SendForm
            recipient={recipient}
            setRecipient={setRecipient}
            amount={amount}
            setAmount={setAmount}
            tokenSymbol={tokenSymbol}
            balance={formatBalance(balance)}
            onSend={sendTx}
          />

        </section>


        {/* =================================================
            SECURITY
        ================================================= */}

        <div
          className="
            mt-4
            flex
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-4
          "
        >

          <ShieldCheck
            size={18}
            className="
              mt-0.5
              shrink-0
              text-cyan-400
            "
          />


          <div>

            <p
              className="
                text-xs
                font-bold
                text-white/60
              "
            >
              Secure payments
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-white/35
              "
            >
              Transactions are signed directly
              by your connected wallet on the
              IOPn network.
            </p>

          </div>

        </div>


        {/* =================================================
            TRANSACTION HISTORY
        ================================================= */}

        <section className="mt-5">

          <TransactionHistory
            address={address}
            liveTxs={liveTxs}
          />

        </section>


        {/* =================================================
            LAST TRANSACTION
        ================================================= */}

        {txHash && (

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-emerald-400/10
              bg-emerald-400/[0.04]
              p-4
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
                size={15}
                className="text-emerald-400"
              />

              <span
                className="
                  text-xs
                  font-bold
                  text-emerald-400
                "
              >
                Last Transaction
              </span>

            </div>


            <p
              className="
                mt-2
                break-all
                font-mono
                text-[10px]
                text-white/40
              "
            >
              {txHash}
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          RECEIVE MODAL
      ===================================================== */}

      <ReceiveModal
        isOpen={showReceive}
        onClose={() =>
          setShowReceive(false)
        }
        address={address}
      />


      {/* =====================================================
          VIRTUAL CARD
      ===================================================== */}

      <VirtualCard
        isOpen={showCard}
        onClose={() =>
          setShowCard(false)
        }
        balance={formatBalance(balance)}
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
        onScan={(addr: string) =>
          setRecipient(addr)
        }
      />

    </main>

  );
}