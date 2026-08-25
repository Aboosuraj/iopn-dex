"use client";

import { useEffect, useState } from "react";

const API = "https://iopndex.onrender.com";

type Tx = {
  from: string;
  to: string;
  amount: string;
  token: string;
  hash: string;
  status?: "pending" | "confirmed" | "failed";
  createdAt?: string;
};

type Props = {
  address?: string;
  liveTxs: Tx[];
};

export default function TransactionHistory({
  address,
  liveTxs,
}: Props) {
  const [history, setHistory] = useState<Tx[]>([]);

  /* =========================================================
     LOAD HISTORY
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        if (!address) return;

        const res = await fetch(
          `${API}/api/history?address=${address}`
        );

        const data = await res.json();

        if (data?.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error(
          "History load failed:",
          err
        );
      }
    }

    load();
  }, [address]);

  /* =========================================================
     MERGE LIVE + HISTORY
  ========================================================= */

  const merged = [
    ...liveTxs,
    ...history,
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="mt-5">

      {/* =====================================================
          TITLE
      ===================================================== */}

      <h2 className="mb-2 px-1 text-sm font-bold text-white">
        Transaction History
      </h2>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {merged.length === 0 && (
        <p className="px-1 text-xs text-white/40">
          No transactions yet
        </p>
      )}


      {/* =====================================================
          LIST
      ===================================================== */}

      <div className="space-y-1.5">

        {merged.map((tx, i) => (

          <div
            key={`${tx.hash}-${i}`}
            className="
              rounded-lg
              border
              border-white/[0.07]
              bg-white/[0.035]
              px-2.5
              py-2
            "
          >

            {/* =================================================
                FROM → TO
            ================================================= */}

            <p
              className="
                truncate
                text-[9px]
                leading-3
                text-white/45
              "
              title={`${tx.from} → ${tx.to}`}
            >
              {tx.from} → {tx.to}
            </p>


            {/* =================================================
                BOTTOM ROW
            ================================================= */}

            <div
              className="
                mt-1.5
                flex
                items-center
                justify-between
                gap-2
              "
            >

              {/* AMOUNT */}

              <p
                className="
                  truncate
                  text-[11px]
                  font-bold
                  text-green-400
                "
              >
                {tx.amount} {tx.token}
              </p>


              {/* STATUS + VIEW */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >

                <span
                  className={`
                    text-[8px]
                    font-semibold
                    uppercase
                    ${
                      tx.status === "confirmed"
                        ? "text-green-400"
                        : tx.status === "failed"
                        ? "text-red-400"
                        : "text-yellow-300"
                    }
                  `}
                >
                  {tx.status || "pending"}
                </span>


                {/* HASH LINK */}

                <a
                  href={`https://testnet.iopn.tech/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    rounded-md
                    bg-blue-400/10
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-semibold
                    text-blue-400
                    transition
                    hover:bg-blue-400/20
                    hover:text-blue-300
                  "
                >
                  View
                </a>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}