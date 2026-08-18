"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useConnect,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Rocket,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import artifact from "@/artifacts/IOPnToken.json";

export default function DeployTokenPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const {
    deployContract,
    data: txHash,
    isPending,
    error,
  } = useDeployContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [decimals, setDecimals] = useState("18");

  const [deployError, setDeployError] = useState("");
  const [copied, setCopied] = useState(false);

  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!symbol.trim()) return false;
    if (!supply || Number(supply) <= 0) return false;

    const decimalValue = Number(decimals);

    if (
      !Number.isInteger(decimalValue) ||
      decimalValue < 0 ||
      decimalValue > 18
    ) {
      return false;
    }

    return true;
  }, [name, symbol, supply, decimals]);

  function handleDeploy() {
    setDeployError("");

    if (!isConnected) {
      if (connectors.length > 0) {
        connect({
          connector: connectors[0],
        });
      }

      return;
    }

    if (!isValid) {
      setDeployError(
        "Please enter a valid token name, symbol, supply and decimals."
      );
      return;
    }

    try {
      const initialSupply = parseUnits(
        supply,
        Number(decimals)
      );

      deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        args: [
          name.trim(),
          symbol.trim().toUpperCase(),
          initialSupply,
          Number(decimals),
        ],
      });
    } catch (err) {
      setDeployError(
        err instanceof Error
          ? err.message
          : "Unable to prepare deployment transaction."
      );
    }
  }

  async function copyHash() {
    if (!txHash) return;

    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  const isBusy = isPending || isConfirming;

  return (
    <main className="min-h-screen bg-[#030712] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto w-full max-w-md">

        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-white/10
              bg-white/[0.04]
              transition
              hover:bg-white/[0.08]
            "
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              IOPn Testnet
            </p>

            <h1 className="text-2xl font-black">
              Deploy Token
            </h1>
          </div>
        </div>

        {/* HERO */}
        <section
          className="
            relative overflow-hidden
            rounded-[28px]
            border border-cyan-400/10
            bg-white/[0.035]
            p-5
            shadow-[0_20px_70px_rgba(0,0,0,0.35)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-cyan-400/[0.08]
              blur-3xl
            "
          />

          <div className="relative">
            <div
              className="
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/10
              "
            >
              <Rocket
                size={24}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-xl font-black">
              Create your own token
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Deploy a standard ERC-20 token directly on
              IOPn Testnet using your connected wallet.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck size={15} />
              <span>
                Non-custodial deployment
              </span>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section
          className="
            mt-4
            rounded-[28px]
            border border-white/[0.08]
            bg-white/[0.035]
            p-5
            backdrop-blur-xl
          "
        >
          <div className="space-y-4">

            {/* TOKEN NAME */}
            <div>
              <label
                htmlFor="token-name"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-white/45
                "
              >
                Token Name
              </label>

              <input
                id="token-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="My Token"
                maxLength={50}
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-black/20
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-cyan-400/40
                "
              />
            </div>

            {/* SYMBOL */}
            <div>
              <label
                htmlFor="token-symbol"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-white/45
                "
              >
                Token Symbol
              </label>

              <input
                id="token-symbol"
                type="text"
                value={symbol}
                onChange={(event) =>
                  setSymbol(
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="MTK"
                maxLength={12}
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-black/20
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-cyan-400/40
                "
              />
            </div>

            {/* SUPPLY */}
            <div>
              <label
                htmlFor="token-supply"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-white/45
                "
              >
                Initial Supply
              </label>

              <input
                id="token-supply"
                type="text"
                inputMode="decimal"
                value={supply}
                onChange={(event) =>
                  setSupply(event.target.value)
                }
                placeholder="1000000"
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-black/20
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-cyan-400/40
                "
              />

              <p className="mt-2 text-[11px] text-white/35">
                Example: 1,000,000 tokens
              </p>
            </div>

            {/* DECIMALS */}
            <div>
              <label
                htmlFor="token-decimals"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-white/45
                "
              >
                Decimals
              </label>

              <input
                id="token-decimals"
                type="number"
                min="0"
                max="18"
                value={decimals}
                onChange={(event) =>
                  setDecimals(event.target.value)
                }
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-black/20
                  px-4
                  py-3.5
                  text-sm
                  text-white
                  outline-none
                  focus:border-cyan-400/40
                "
              />

              <p className="mt-2 text-[11px] text-white/35">
                Standard ERC-20 setting: 18
              </p>
            </div>
          </div>

          {/* WALLET */}
          <div
            className="
              mt-5
              rounded-2xl
              border border-white/[0.08]
              bg-black/20
              p-4
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-cyan-400/10
                "
              >
                <Wallet
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Deployment wallet
                </p>

                <p className="mt-1 truncate text-sm font-semibold">
                  {address
                    ? `${address.slice(0, 8)}...${address.slice(-6)}`
                    : "Not connected"}
                </p>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {(deployError || error) && (
            <div
              className="
                mt-4
                rounded-2xl
                border border-red-400/20
                bg-red-400/[0.06]
                p-4
                text-sm
                leading-6
                text-red-300
              "
            >
              {deployError ||
                error?.message ||
                "Deployment failed."}
            </div>
          )}

          {/* DEPLOY BUTTON */}
          <button
            type="button"
            onClick={handleDeploy}
            disabled={isBusy}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-cyan-400
              px-5
              py-4
              text-sm
              font-black
              text-black
              transition
              hover:bg-cyan-300
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isBusy ? (
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

                {isConfirming
                  ? "Confirming deployment..."
                  : "Deploying..."}
              </>
            ) : !isConnected ? (
              <>
                <Wallet size={17} />
                Connect Wallet
              </>
            ) : (
              <>
                <Rocket size={17} />
                Deploy Token
              </>
            )}
          </button>
        </section>

        {/* SUCCESS */}
        {isConfirmed && txHash && (
          <section
            className="
              mt-4
              rounded-[28px]
              border border-emerald-400/20
              bg-emerald-400/[0.06]
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11
                  items-center justify-center
                  rounded-2xl
                  bg-emerald-400/10
                "
              >
                <CheckCircle2
                  size={23}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h3 className="font-black text-emerald-300">
                  Deployment Confirmed
                </h3>

                <p className="mt-1 text-xs text-white/45">
                  Your deployment transaction has been
                  confirmed on IOPn Testnet.
                </p>
              </div>
            </div>

            {/* TX HASH */}
            <div
              className="
                mt-4
                rounded-2xl
                border border-white/10
                bg-black/20
                p-4
              "
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Transaction Hash
              </p>

              <div className="mt-2 flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-xs text-white/75">
                  {txHash}
                </p>

                <button
                  type="button"
                  onClick={copyHash}
                  className="
                    shrink-0
                    rounded-lg
                    p-2
                    transition
                    hover:bg-white/10
                  "
                >
                  <Copy size={15} />
                </button>
              </div>

              {copied && (
                <p className="mt-2 text-[10px] text-emerald-400">
                  Transaction hash copied.
                </p>
              )}
            </div>

            {/* IMPORTANT */}
            <div
              className="
                mt-4
                rounded-2xl
                border border-cyan-400/10
                bg-cyan-400/[0.04]
                p-4
              "
            >
              <p className="text-xs leading-5 text-white/55">
                The transaction has been confirmed. The
                deployed token contract address will be
                extracted from the deployment receipt in
                the next step.
              </p>
            </div>

            {/* TRANSACTION LINK */}
            <button
              type="button"
              disabled
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                border border-white/10
                bg-white/[0.05]
                px-4
                py-3
                text-sm
                font-bold
                text-white/40
                cursor-not-allowed
              "
            >
              View Transaction
              <ExternalLink size={15} />
            </button>
          </section>
        )}
      </div>
    </main>
  );
}