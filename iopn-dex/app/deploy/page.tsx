"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import {
  encodeAbiParameters,
  parseUnits,
} from "viem";
import {
  Check,
  ExternalLink,
  FileCode2,
  Loader2,
  Rocket,
  ShieldCheck,
  Wallet,
  ArrowLeft,
  Copy,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL = "https://testnet.iopn.tech";

/* =========================================================
   TYPES
========================================================= */

type DeploymentState =
  | "idle"
  | "deploying"
  | "deployed"
  | "indexing"
  | "verifying"
  | "verified"
  | "failed";

type VerificationResponse = {
  success?: boolean;
  verified?: boolean;
  explorerConfirmed?: boolean;
  submitted?: boolean;
  alreadyVerified?: boolean;
  waitingForIndexing?: boolean;
  verificationId?: string | null;
  message?: string;
  error?: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DeployPage() {
  const { address, isConnected } = useAccount();

  const publicClient = usePublicClient();

  const { data: walletClient } = useWalletClient();

  /* =======================================================
     FORM
  ======================================================= */

  const [name, setName] = useState("IOPn Token");
  const [symbol, setSymbol] = useState("IOPN");
  const [supply, setSupply] = useState("1000000");
  const [decimals, setDecimals] = useState("18");

  /* =======================================================
     DEPLOYMENT STATE
  ======================================================= */

  const [contractAddress, setContractAddress] =
    useState("");

  const [transactionHash, setTransactionHash] =
    useState("");

  const [state, setState] =
    useState<DeploymentState>("idle");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [verificationId, setVerificationId] =
    useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  /* =======================================================
     LOAD ARTIFACT
  ======================================================= */

  async function loadArtifact() {
    const response = await fetch(
      "/api/deploy/artifact",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load IOPnToken artifact."
      );
    }

    const data = await response.json();

    if (
      !data?.success ||
      !data?.artifact
    ) {
      throw new Error(
        "IOPnToken artifact is unavailable."
      );
    }

    return data.artifact;
  }

  /* =======================================================
     LOAD EXACT STANDARD JSON
  ======================================================= */

  async function loadStandardInput() {
    const response = await fetch(
      "/api/deploy/artifact",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load IOPnToken-standard-input.json."
      );
    }

    const data = await response.json();

    if (
      !data?.success ||
      typeof data.standardInput !==
        "string" ||
      !data.standardInput.trim()
    ) {
      throw new Error(
        "IOPnToken Standard JSON input is unavailable."
      );
    }

    JSON.parse(data.standardInput);

    return data.standardInput;
  }

  /* =======================================================
     EXPLORER CHECK

     Explorer is the ONLY source of truth for verification.
  ======================================================= */

  async function checkExplorer(
    contract: string
  ) {
    const response = await fetch(
      `/api/verify?address=${encodeURIComponent(
        contract
      )}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        verified: false,
        indexed: false,
      };
    }

    const data = await response.json();

    return {
      verified:
        data?.verified === true &&
        data?.explorerConfirmed === true,

      indexed:
        data?.indexed === true,
    };
  }

  /* =======================================================
     WAIT FOR EXPLORER INDEXING
  ======================================================= */

  async function waitForIndexing(
    contract: string
  ) {
    setState("indexing");

    setMessage(
      "Waiting for IOPn Explorer to index the deployed contract..."
    );

    for (
      let attempt = 1;
      attempt <= 20;
      attempt++
    ) {
      const result =
        await checkExplorer(contract);

      if (result.verified) {
        return {
          verified: true,
          indexed: true,
        };
      }

      if (result.indexed) {
        return {
          verified: false,
          indexed: true,
        };
      }

      setMessage(
        `Waiting for Explorer indexing... (${attempt}/20)`
      );

      if (attempt < 20) {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 1500)
        );
      }
    }

    return {
      verified: false,
      indexed: false,
    };
  }

  /* =======================================================
     CONSTRUCTOR ARGUMENTS
  ======================================================= */

  function encodeConstructorArguments(
    tokenName: string,
    tokenSymbol: string,
    totalSupply: bigint,
    tokenDecimals: number,
    owner: `0x${string}`
  ) {
    const encoded =
      encodeAbiParameters(
        [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "totalSupply",
            type: "uint256",
          },
          {
            name: "decimals",
            type: "uint8",
          },
          {
            name: "owner",
            type: "address",
          },
        ],
        [
          tokenName,
          tokenSymbol,
          totalSupply,
          tokenDecimals,
          owner,
        ]
      );

    return encoded.slice(2);
  }

  /* =======================================================
     AUTOMATIC VERIFICATION
  ======================================================= */

  async function verifyContract(
    contract: string,
    totalSupply: bigint,
    tokenDecimals: number
  ) {
    setState("verifying");

    setMessage(
      "Submitting the exact Standard JSON compilation to the IOPn Explorer..."
    );

    const standardInput =
      await loadStandardInput();

    const constructorArgs =
      encodeConstructorArguments(
        name.trim(),
        symbol.trim(),
        totalSupply,
        tokenDecimals,
        address!
      );

    const response = await fetch(
      "/api/markets/verify-token",
      {
        method: "POST",

        cache: "no-store",

        body: (() => {
          const form = new FormData();

          form.append(
            "address",
            contract
          );

          form.append(
            "compiler_version",
            "v0.8.36+commit.8a079791"
          );

          form.append(
            "contract_name",
            "IOPnToken"
          );

          form.append(
            "license_type",
            "mit"
          );

          form.append(
            "constructor_args",
            constructorArgs
          );

          form.append(
            "standard_input",
            standardInput
          );

          return form;
        })(),
      }
    );

    const data =
      (await response.json()) as VerificationResponse;

    if (data.verificationId) {
      setVerificationId(
        data.verificationId
      );
    }

    /*
     * NEVER trust the verification POST response.
     * Ask the actual Explorer.
     */

    const immediate =
      await checkExplorer(contract);

    if (immediate.verified) {
      setState("verified");

      setMessage(
        "✓ Explorer confirms that the contract source code is verified."
      );

      return true;
    }

    /*
     * Poll Explorer until verification is confirmed.
     */

    for (
      let attempt = 1;
      attempt <= 30;
      attempt++
    ) {
      setState("verifying");

      setMessage(
        `Waiting for Explorer verification... (${attempt}/30)`
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 2500)
      );

      const result =
        await checkExplorer(contract);

      if (result.verified) {
        setState("verified");

        setMessage(
          "✓ Verified on IOPn Explorer."
        );

        return true;
      }
    }

    /*
     * Explorer never confirmed it.
     */

    setState("deployed");

    setMessage(
      data.message ||
        "Verification was submitted, but the Explorer has not confirmed the source code as verified."
    );

    return false;
  }

  /* =======================================================
     DEPLOY
  ======================================================= */

  async function deploy() {
    setError("");
    setMessage("");
    setContractAddress("");
    setTransactionHash("");
    setVerificationId(null);
    setCopied(false);

    if (!isConnected) {
      setError(
        "Connect your wallet first."
      );
      return;
    }

    if (!address) {
      setError(
        "Connected wallet address is unavailable."
      );
      return;
    }

    if (!walletClient) {
      setError(
        "Wallet client is unavailable."
      );
      return;
    }

    if (!publicClient) {
      setError(
        "Blockchain client is unavailable."
      );
      return;
    }

    if (!name.trim()) {
      setError(
        "Token name is required."
      );
      return;
    }

    if (!symbol.trim()) {
      setError(
        "Token symbol is required."
      );
      return;
    }

    if (!supply.trim()) {
      setError(
        "Token supply is required."
      );
      return;
    }

    const decimalsNumber =
      Number(decimals);

    if (
      !Number.isInteger(
        decimalsNumber
      ) ||
      decimalsNumber < 0 ||
      decimalsNumber > 18
    ) {
      setError(
        "Decimals must be an integer between 0 and 18."
      );
      return;
    }

    let totalSupply: bigint;

    try {
      totalSupply = parseUnits(
        supply,
        decimalsNumber
      );
    } catch {
      setError(
        "Invalid token supply."
      );
      return;
    }

    try {
      /* =================================================
         STEP 1 — DEPLOY
      ================================================= */

      setState("deploying");

      setMessage(
        "Deploying your token to OPN Chain..."
      );

      const artifact =
        await loadArtifact();

      if (
        !artifact?.abi ||
        !artifact?.bytecode
      ) {
        throw new Error(
          "IOPnToken artifact is missing ABI or bytecode."
        );
      }

      const hash =
        await walletClient.deployContract(
          {
            abi: artifact.abi,

            bytecode:
              artifact.bytecode as `0x${string}`,

            args: [
              name.trim(),
              symbol.trim(),
              totalSupply,
              decimalsNumber,
              address,
            ],
          }
        );

      setTransactionHash(hash);

      setMessage(
        "Transaction submitted. Waiting for blockchain confirmation..."
      );

      /* =================================================
         STEP 2 — RECEIPT
      ================================================= */

      const receipt =
        await publicClient.waitForTransactionReceipt(
          {
            hash,
          }
        );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "Contract deployment transaction failed."
        );
      }

      /* =================================================
         STEP 3 — CONTRACT ADDRESS
      ================================================= */

      const deployedAddress =
        receipt.contractAddress;

      if (!deployedAddress) {
        throw new Error(
          "Deployment succeeded but no contract address was returned."
        );
      }

      setContractAddress(
        deployedAddress
      );

      setState("deployed");

      setMessage(
        "Token deployed successfully. Checking the IOPn Explorer..."
      );

      /* =================================================
         STEP 4 — INDEXING
      ================================================= */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * Explorer already verified it.
       */

      if (
        explorerState.verified
      ) {
        setState("verified");

        setMessage(
          "✓ Explorer confirms that this contract is verified."
        );

        return;
      }

      /*
       * Continue with automatic verification.
       */

      if (
        !explorerState.indexed
      ) {
        setMessage(
          "Explorer has not indexed the contract yet. Preparing verification..."
        );
      }

      /* =================================================
         STEP 5 — AUTOMATIC VERIFICATION
      ================================================= */

      await verifyContract(
        deployedAddress,
        totalSupply,
        decimalsNumber
      );
    } catch (err) {
      console.error(
        "Deployment error:",
        err
      );

      setState("failed");

      setError(
        err instanceof Error
          ? err.message
          : "Deployment failed."
      );

      setMessage("");
    }
  }

  /* =======================================================
     COPY ADDRESS
  ======================================================= */

  async function copyAddress() {
    if (!contractAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        contractAddress
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      // Ignore clipboard errors.
    }
  }

  /* =======================================================
     UI STATE
  ======================================================= */

  const isBusy =
    state === "deploying" ||
    state === "indexing" ||
    state === "verifying";

  const explorerContractUrl =
    contractAddress
      ? `${EXPLORER_URL}/address/${contractAddress}?tab=contract`
      : "";

  const explorerTransactionUrl =
    transactionHash
      ? `${EXPLORER_URL}/tx/${transactionHash}`
      : "";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[380px] w-[380px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute left-[-150px] top-[45%] h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize:
              "42px 42px",
          }}
        />
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">

        {/* =================================================
            TOP NAV
        ================================================= */}

        <div className="mb-10 flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-cyan-400/30 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={15}
            />

            Dashboard
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-xs font-medium text-cyan-300">
              OPN TESTNET
            </span>
          </div>
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="mb-8 text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
            <Rocket
              size={28}
              className="text-cyan-300"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Create Tokens
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              with Fun on OPN Chain
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
            Launch your own token on the OPN
            Chain testnet in seconds. Deploy
            directly from your wallet and let
            the IOPn Explorer confirm the
            contract verification.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              ⚡ Fast deployment
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              🔐 Wallet controlled
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              ✓ Explorer verified
            </span>
          </div>
        </section>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* CARD HEADER */}

          <div className="border-b border-white/10 px-5 py-5 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <FileCode2
                  size={20}
                />
              </div>

              <div>
                <h2 className="font-semibold">
                  Token Configuration
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Define the basic properties
                  of your token
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}

          <div className="space-y-5 p-5 sm:p-7">

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Token name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                disabled={isBusy}
                placeholder="e.g. My Token"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* SYMBOL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Token symbol
              </label>

              <input
                value={symbol}
                onChange={(event) =>
                  setSymbol(
                    event.target.value
                  )
                }
                disabled={isBusy}
                placeholder="e.g. MTK"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm uppercase text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* SUPPLY + DECIMALS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Total supply
                </label>

                <input
                  value={supply}
                  onChange={(event) =>
                    setSupply(
                      event.target.value
                    )
                  }
                  disabled={isBusy}
                  inputMode="decimal"
                  placeholder="1000000"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Initial token supply
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Decimals
                </label>

                <input
                  value={decimals}
                  onChange={(event) =>
                    setDecimals(
                      event.target.value
                    )
                  }
                  disabled={isBusy}
                  inputMode="numeric"
                  placeholder="18"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Usually 18 decimals
                </p>
              </div>
            </div>

            {/* DEPLOY BUTTON */}

            <div className="pt-2">

              <button
                type="button"
                onClick={deploy}
                disabled={
                  isBusy ||
                  !isConnected
                }
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-sm font-bold text-black shadow-[0_0_30px_rgba(34,211,238,0.15)] transition hover:from-cyan-300 hover:to-blue-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
              >

                {isBusy ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    {state ===
                    "deploying"
                      ? "Deploying Token..."
                      : state ===
                        "indexing"
                      ? "Checking Explorer..."
                      : "Verifying Contract..."}
                  </>
                ) : state ===
                  "verified" ? (
                  <>
                    <Check
                      size={18}
                    />

                    Verified
                  </>
                ) : (
                  <>
                    <Rocket
                      size={18}
                    />

                    Deploy Token
                  </>
                )}
              </button>

              {!isConnected && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-400">
                  <Wallet
                    size={14}
                  />

                  Connect your wallet
                  to deploy
                </div>
              )}
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            {message && (
              <div
                className={`rounded-xl border p-4 ${
                  state === "verified"
                    ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                    : state ===
                        "failed"
                    ? "border-red-400/20 bg-red-400/[0.05]"
                    : "border-cyan-400/10 bg-cyan-400/[0.03]"
                }`}
              >
                <div className="flex items-start gap-3">

                  <div className="mt-0.5 shrink-0">
                    {state ===
                    "verified" ? (
                      <Check
                        size={17}
                        className="text-emerald-400"
                      />
                    ) : isBusy ? (
                      <Loader2
                        size={17}
                        className="animate-spin text-cyan-400"
                      />
                    ) : (
                      <ShieldCheck
                        size={17}
                        className="text-cyan-400"
                      />
                    )}
                  </div>

                  <p className="text-sm leading-6 text-zinc-300">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4">
                <p className="text-sm leading-6 text-red-300">
                  {error}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            DEPLOYMENT RESULT
        ================================================= */}

        {contractAddress && (
          <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">

            <div className="border-b border-white/10 px-5 py-5 sm:px-7">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    state === "verified"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-blue-400/10 text-blue-400"
                  }`}
                >
                  {state ===
                  "verified" ? (
                    <ShieldCheck
                      size={20}
                    />
                  ) : (
                    <Rocket
                      size={20}
                    />
                  )}
                </div>

                <div>
                  <h2 className="font-semibold">
                    {state ===
                    "verified"
                      ? "Token Verified"
                      : "Token Deployed"}
                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {state ===
                    "verified"
                      ? "Confirmed by the IOPn Explorer"
                      : "Your contract is live on OPN Chain"}
                  </p>
                </div>

              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-7">

              {/* CONTRACT ADDRESS */}

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    Contract address
                  </p>

                  <button
                    type="button"
                    onClick={copyAddress}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-cyan-400"
                  >
                    {copied ? (
                      <>
                        <Check
                          size={13}
                        />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy
                          size={13}
                        />
                        Copy
                      </>
                    )}
                  </button>

                </div>

                <p className="break-all font-mono text-xs leading-6 text-zinc-300 sm:text-sm">
                  {contractAddress}
                </p>

                <a
                  href={
                    explorerContractUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  View contract on Explorer

                  <ExternalLink
                    size={13}
                  />
                </a>
              </div>

              {/* TRANSACTION */}

              {transactionHash && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    Deployment transaction
                  </p>

                  <p className="break-all font-mono text-xs leading-6 text-zinc-500">
                    {transactionHash}
                  </p>

                  <a
                    href={
                      explorerTransactionUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                  >
                    View transaction

                    <ExternalLink
                      size={13}
                    />
                  </a>
                </div>
              )}

              {/* VERIFIED */}

              {state ===
                "verified" && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black">
                      <Check
                        size={18}
                        strokeWidth={3}
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-emerald-300">
                        Verified on IOPn
                        Explorer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                        The Explorer has
                        confirmed the
                        published source
                        code for this
                        contract.
                      </p>
                    </div>

                  </div>

                  <a
                    href={
                      explorerContractUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                  >
                    Confirm on Explorer

                    <ExternalLink
                      size={13}
                    />
                  </a>
                </div>
              )}

              {/* NOT VERIFIED */}

              {state ===
                "deployed" && (
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
                      !
                    </div>

                    <div>
                      <p className="font-semibold text-amber-300">
                        Deployed — awaiting
                        Explorer verification
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-400/60">
                        This contract is not
                        shown as verified
                        unless the IOPn
                        Explorer confirms
                        the source code.
                      </p>
                    </div>

                  </div>

                  <a
                    href={
                      explorerContractUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                  >
                    Open Explorer

                    <ExternalLink
                      size={13}
                    />
                  </a>
                </div>
              )}

              {/* VERIFICATION REQUEST */}

              {verificationId && (
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-700">
                    Verification request ID
                  </p>

                  <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">
                    {verificationId}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-8 text-center">

          <p className="text-xs text-zinc-700">
            Powered by OPN Chain
          </p>

          <Link
            href="/"
            className="mt-2 inline-block text-xs text-zinc-600 transition hover:text-zinc-300"
          >
            ← Back to dashboard
          </Link>

        </div>
      </div>
    </main>
  );
}