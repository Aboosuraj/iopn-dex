"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Info,
  Loader2,
  Rocket,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";

import {
  encodeAbiParameters,
  parseUnits,
  type Abi,
  type Address,
  type Hex,
} from "viem";

/* =========================================================
   TYPES
========================================================= */

type ContractArtifact = {
  abi: Abi;
  bytecode: Hex | string;
  contractName?: string;
  compiler?: {
    version?: string;
    fullVersion?: string;
  };
  optimization?: {
    enabled?: boolean;
    runs?: number;
  };
};

type ConstructorArgs = readonly [
  string,
  string,
  bigint,
  number,
  Address
];

type DeployStatus =
  | "idle"
  | "loading"
  | "confirming"
  | "success"
  | "error";

type VerificationStatus =
  | "idle"
  | "loading"
  | "checking"
  | "submitted"
  | "verified"
  | "error";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const DEFAULT_DECIMALS = 18;

const CONTRACT_NAME =
  "IOPnToken";

const LICENSE_TYPE =
  "mit";

const VERIFICATION_POLL_INTERVAL = 3000;

const VERIFICATION_MAX_ATTEMPTS = 20;

/* =========================================================
   COMPONENT
========================================================= */

export default function DeployPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const chainId =
    useChainId();

  const {
    data: walletClient,
  } = useWalletClient();

  /* =======================================================
     FORM
  ======================================================= */

  const [name, setName] =
    useState("");

  const [symbol, setSymbol] =
    useState("");

  const [supply, setSupply] =
    useState("");

  const [decimals, setDecimals] =
    useState(
      String(DEFAULT_DECIMALS)
    );

  /* =======================================================
     ARTIFACT
  ======================================================= */

  const [artifact, setArtifact] =
    useState<ContractArtifact | null>(
      null
    );

  const [
    artifactLoading,
    setArtifactLoading,
  ] = useState(true);

  const [
    artifactError,
    setArtifactError,
  ] = useState("");

  /* =======================================================
     DEPLOYMENT
  ======================================================= */

  const [
    status,
    setStatus,
  ] = useState<DeployStatus>(
    "idle"
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    txHash,
    setTxHash,
  ] = useState<
    Hex | undefined
  >();

  const [
    contractAddress,
    setContractAddress,
  ] = useState<
    Address | undefined
  >();

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    deploymentConstructorArgs,
    setDeploymentConstructorArgs,
  ] = useState<
    ConstructorArgs | null
  >(null);

  /* =======================================================
     VERIFICATION
  ======================================================= */

  const [
    verificationStatus,
    setVerificationStatus,
  ] =
    useState<VerificationStatus>(
      "idle"
    );

  const [
    verificationError,
    setVerificationError,
  ] = useState("");

  const [
    manualVerificationUrl,
    setManualVerificationUrl,
  ] = useState("");

  /* =======================================================
     LOAD ARTIFACT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadArtifact() {
      try {
        setArtifactLoading(true);
        setArtifactError("");

        const response =
          await fetch(
            "/artifacts/IOPnToken.json",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Could not load token contract (${response.status}).`
          );
        }

        const json =
          (await response.json()) as ContractArtifact;

        if (!json.abi) {
          throw new Error(
            "Token artifact does not contain an ABI."
          );
        }

        if (!json.bytecode) {
          throw new Error(
            "Token artifact does not contain deployment bytecode."
          );
        }

        if (!cancelled) {
          setArtifact(json);
        }
      } catch (err) {
        if (!cancelled) {
          setArtifactError(
            err instanceof Error
              ? err.message
              : "Unable to load token contract."
          );
        }
      } finally {
        if (!cancelled) {
          setArtifactLoading(false);
        }
      }
    }

    loadArtifact();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     TRANSACTION RECEIPT
  ======================================================= */

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } =
    useWaitForTransactionReceipt({
      hash: txHash,

      query: {
        enabled: !!txHash,
      },
    });

  /* =======================================================
     URLS
  ======================================================= */

  const transactionUrl =
    txHash
      ? `${EXPLORER_URL}/tx/${txHash}`
      : "";

  const contractUrl =
    contractAddress
      ? `${EXPLORER_URL}/address/${contractAddress}`
      : "";

  const verificationUrl =
    contractAddress
      ? `${EXPLORER_URL}/address/${contractAddress}?tab=contract`
      : "";

  /* =======================================================
     STATE
  ======================================================= */

  const isDeploying =
    status === "loading" ||
    status === "confirming" ||
    isConfirming;

  const hasDeployment =
    status === "success" &&
    !!contractAddress;

  /* =======================================================
     FORMATTING
  ======================================================= */

  function formatSupply(value: string) {
    if (!value) {
      return "0";
    }

    return Number(value).toLocaleString();
  }

  function shortenAddress(
    value?: string
  ) {
    if (!value) {
      return "";
    }

    return `${value.slice(
      0,
      8
    )}...${value.slice(-6)}`;
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetStatus() {
    if (isDeploying) {
      return;
    }

    setStatus("idle");
    setError("");
    setTxHash(undefined);
    setContractAddress(undefined);
    setCopied(false);

    setDeploymentConstructorArgs(
      null
    );

    setVerificationStatus(
      "idle"
    );

    setVerificationError("");
    setManualVerificationUrl("");
  }

  /* =======================================================
     RESET EVERYTHING
  ======================================================= */

  function createAnotherToken() {
    setStatus("idle");

    setError("");

    setTxHash(undefined);

    setContractAddress(
      undefined
    );

    setCopied(false);

    setDeploymentConstructorArgs(
      null
    );

    setVerificationStatus(
      "idle"
    );

    setVerificationError("");

    setManualVerificationUrl("");

    setName("");
    setSymbol("");
    setSupply("");

    setDecimals(
      String(DEFAULT_DECIMALS)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    if (!isConnected || !address) {
      return "Please connect your wallet first.";
    }

    if (!walletClient) {
      return "Your wallet is not ready. Please reconnect your wallet.";
    }

    if (!artifact) {
      return "The token contract is still loading.";
    }

    const trimmedName =
      name.trim();

    const trimmedSymbol =
      symbol
        .trim()
        .toUpperCase();

    if (!trimmedName) {
      return "Enter a token name.";
    }

    if (trimmedName.length > 100) {
      return "Token name must be 100 characters or less.";
    }

    if (!trimmedSymbol) {
      return "Enter a token symbol.";
    }

    if (
      !/^[A-Z0-9]{1,12}$/.test(
        trimmedSymbol
      )
    ) {
      return "Symbol must contain 1–12 letters or numbers.";
    }

    if (!supply.trim()) {
      return "Enter the initial supply.";
    }

    if (
      !/^[0-9]+$/.test(
        supply.trim()
      )
    ) {
      return "Supply must contain whole numbers only.";
    }

    if (
      BigInt(supply.trim()) <=
      0n
    ) {
      return "Initial supply must be greater than zero.";
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
      return "Decimals must be between 0 and 18.";
    }

    return null;
  }

  /* =======================================================
     VERIFY CONTRACT
  ======================================================= */

  async function verifyContract(
    deployedAddress: Address,
    constructorArgs: ConstructorArgs
  ) {
    try {
      setVerificationStatus(
        "loading"
      );

      setVerificationError("");

      const encodedConstructorArgs =
        encodeAbiParameters(
          [
            {
              type: "string",
            },
            {
              type: "string",
            },
            {
              type: "uint256",
            },
            {
              type: "uint8",
            },
            {
              type: "address",
            },
          ],
          constructorArgs
        ).replace(/^0x/, "");

      const standardInputResponse =
        await fetch(
          "/artifacts/IOPnToken-standard-input.json",
          {
            cache: "no-store",
          }
        );

      if (
        !standardInputResponse.ok
      ) {
        throw new Error(
          "Verification source file is unavailable."
        );
      }

      const standardInput =
        await standardInputResponse.text();

      const compilerVersion =
        artifact?.compiler?.version ||
        "v0.8.36+commit.8a079791";

      const optimizationEnabled =
        artifact?.optimization?.enabled ??
        true;

      const optimizationRuns =
        artifact?.optimization?.runs ??
        200;

      const response =
        await fetch(
          "/api/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              address:
                deployedAddress,

              contractName:
                CONTRACT_NAME,

              compilerVersion,

              licenseType:
                LICENSE_TYPE,

              standardInput,

              constructorArgs:
                encodedConstructorArgs,

              autodetectConstructorArgs:
                false,

              optimizationEnabled,

              optimizationRuns,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result?.error ||
            result?.message ||
            "Explorer verification failed."
        );
      }

      setVerificationStatus(
        "submitted"
      );

      if (
        result.verified === true
      ) {
        setVerificationStatus(
          "verified"
        );

        return;
      }

      await pollVerificationStatus(
        deployedAddress
      );
    } catch (err) {
      console.error(
        "Automatic verification failed:",
        err
      );

      setVerificationStatus(
        "error"
      );

      setVerificationError(
        err instanceof Error
          ? err.message
          : "Automatic verification failed."
      );

      if (contractAddress) {
        setManualVerificationUrl(
          `${EXPLORER_URL}/address/${contractAddress}?tab=contract`
        );
      }
    }
  }

  /* =======================================================
     POLL VERIFICATION
  ======================================================= */

  async function pollVerificationStatus(
    deployedAddress: Address
  ) {
    setVerificationStatus(
      "checking"
    );

    for (
      let attempt = 1;
      attempt <=
      VERIFICATION_MAX_ATTEMPTS;
      attempt++
    ) {
      try {
        const response =
          await fetch(
            `/api/verify?address=${deployedAddress}`,
            {
              cache: "no-store",
            }
          );

        if (response.ok) {
          const data =
            await response.json();

          if (
            data?.verified === true ||
            data?.isVerified === true ||
            data?.isFullyVerified === true
          ) {
            setVerificationStatus(
              "verified"
            );

            return;
          }
        }
      } catch (err) {
        console.warn(
          "Verification status check failed:",
          err
        );
      }

      if (
        attempt <
        VERIFICATION_MAX_ATTEMPTS
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              VERIFICATION_POLL_INTERVAL
            )
        );
      }
    }

    setVerificationStatus(
      "submitted"
    );
  }

  /* =======================================================
     MANUAL VERIFICATION
  ======================================================= */

  function openManualVerification() {
    if (!contractAddress) {
      return;
    }

    const url =
      `${EXPLORER_URL}/address/${contractAddress}?tab=contract`;

    setManualVerificationUrl(
      url
    );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     DEPLOY
  ======================================================= */

  async function handleDeploy(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isDeploying) {
      return;
    }

    setError("");
    setContractAddress(undefined);
    setTxHash(undefined);

    setVerificationStatus(
      "idle"
    );

    setVerificationError("");

    setManualVerificationUrl("");

    setDeploymentConstructorArgs(
      null
    );

    const validationError =
      validateForm();

    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    if (
      !walletClient ||
      !artifact ||
      !address
    ) {
      setStatus("error");

      setError(
        "Wallet or contract information is unavailable."
      );

      return;
    }

    try {
      setStatus("loading");

      const trimmedName =
        name.trim();

      const trimmedSymbol =
        symbol
          .trim()
          .toUpperCase();

      const decimalsNumber =
        Number(decimals);

      const initialSupply =
        parseUnits(
          supply.trim(),
          decimalsNumber
        );

      const constructorArgs = [
        trimmedName,
        trimmedSymbol,
        initialSupply,
        decimalsNumber,
        address,
      ] as const;

      setDeploymentConstructorArgs(
        constructorArgs
      );

      const hash =
        await walletClient.deployContract(
          {
            abi: artifact.abi,

            bytecode:
              artifact.bytecode as Hex,

            args:
              constructorArgs,

            account:
              address,

            chain:
              walletClient.chain,
          }
        );

      setTxHash(hash);

      setStatus(
        "confirming"
      );
    } catch (err) {
      console.error(
        "Token deployment failed:",
        err
      );

      setStatus("error");

      setError(
        err instanceof Error
          ? err.message
          : "Token deployment failed."
      );
    }
  }

  /* =======================================================
     RECEIPT EFFECT
  ======================================================= */

  useEffect(() => {
    if (
      !isConfirmed ||
      !receipt?.contractAddress
    ) {
      return;
    }

    const deployedAddress =
      receipt.contractAddress;

    setContractAddress(
      deployedAddress
    );

    setStatus("success");

    if (
      !deploymentConstructorArgs
    ) {
      setVerificationStatus(
        "error"
      );

      setVerificationError(
        "Deployment succeeded, but the constructor information was unavailable."
      );

      return;
    }

    verifyContract(
      deployedAddress,
      deploymentConstructorArgs
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConfirmed,
    receipt,
  ]);

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
        1800
      );
    } catch {
      setCopied(false);
    }
  }

  /* =======================================================
     VERIFICATION UI
  ======================================================= */

  function renderVerification() {
    if (
      verificationStatus ===
      "loading"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Preparing verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                We are preparing the exact source,
                compiler settings and constructor information
                used for your deployment.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "checking"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Checking verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Your contract has been submitted to the
                explorer. We are waiting for the explorer
                to finish processing it.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "submitted"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div className="min-w-0">
              <p className="font-bold">
                Verification submitted
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                The explorer accepted the verification
                request. It may take a little longer to display
                the verified source.
              </p>

              <button
                type="button"
                onClick={
                  openManualVerification
                }
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-400"
              >
                Check manually
                <ExternalLink
                  size={13}
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "verified"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div>
              <p className="font-black text-emerald-300">
                Contract verified
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Your token source code is verified on
                the IOPn Explorer.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "error"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-300">
                Automatic verification needs attention
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-white/40">
                {verificationError}
              </p>

              <p className="mt-2 text-xs leading-5 text-white/30">
                Your token deployment was successful.
                You can open the contract and verify it
                manually if necessary.
              </p>

              <button
                type="button"
                onClick={
                  openManualVerification
                }
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-4 text-xs font-black text-black transition hover:bg-amber-300"
              >
                <FileCheck2
                  size={15}
                />

                Verify Manually

                <ExternalLink
                  size={13}
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#030712] px-4 pb-28 pt-6 text-white">
      <div className="mx-auto w-full max-w-2xl">

        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Rocket
                size={24}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Create Token
              </h1>

              <p className="mt-1 text-sm text-white/40">
                Create your own ERC-20 token on IOPn
                Testnet
              </p>
            </div>
          </div>
        </div>

        {/* STEP INDICATOR */}

        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-2.5 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              01
            </p>

            <p className="mt-1 text-[10px] font-bold text-white/50">
              Information
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
              02
            </p>

            <p className="mt-1 text-[10px] font-bold text-white/30">
              Deploy
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">
              03
            </p>

            <p className="mt-1 text-[10px] font-bold text-white/30">
              Verify
            </p>
          </div>
        </div>

        {/* NETWORK */}

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

            <div>
              <p className="text-xs font-black">
                IOPn Testnet
              </p>

              <p className="text-[10px] text-white/30">
                Ready for deployment
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-400">
            Chain {chainId}
          </span>
        </div>

        {/* WALLET */}

        <div className="mb-5 rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
              <Wallet size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Your Wallet
              </p>

              {isConnected &&
              address ? (
                <>
                  <p className="mt-1 text-sm font-bold">
                    {shortenAddress(
                      address
                    )}
                  </p>

                  <p className="mt-0.5 text-[10px] text-emerald-400">
                    Connected
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm font-bold text-red-400">
                  Connect wallet to continue
                </p>
              )}
            </div>

            {isConnected && (
              <CheckCircle2
                size={20}
                className="text-emerald-400"
              />
            )}
          </div>
        </div>

        {/* FORM */}

        {!hasDeployment && (
          <form
            onSubmit={
              handleDeploy
            }
          >
            <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_25px_80px_rgba(0,0,0,.35)] backdrop-blur-xl">

              <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

              <div className="relative">

                {/* INTRO */}

                <div className="mb-6">
                  <h2 className="text-lg font-black">
                    Token Information
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Choose the name, symbol and supply
                    for your new token.
                  </p>
                </div>

                {/* NAME */}

                <div className="mb-5">
                  <label
                    htmlFor="token-name"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45"
                  >
                    Token Name
                  </label>

                  <input
                    id="token-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(
                        e.target.value
                      );
                      resetStatus();
                    }}
                    placeholder="My Token"
                    disabled={
                      isDeploying
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                  />

                  <p className="mt-2 text-[11px] text-white/25">
                    Example: IOPn Community Token
                  </p>
                </div>

                {/* SYMBOL */}

                <div className="mb-5">
                  <label
                    htmlFor="token-symbol"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45"
                  >
                    Token Symbol
                  </label>

                  <input
                    id="token-symbol"
                    type="text"
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(
                        e.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z0-9]/g,
                            ""
                          )
                          .slice(
                            0,
                            12
                          )
                      );

                      resetStatus();
                    }}
                    placeholder="ICT"
                    disabled={
                      isDeploying
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-black uppercase tracking-wide text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                  />

                  <p className="mt-2 text-[11px] text-white/25">
                    1–12 letters or numbers
                  </p>
                </div>

                {/* SUPPLY */}

                <div className="mb-5">
                  <label
                    htmlFor="initial-supply"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45"
                  >
                    Initial Supply
                  </label>

                  <input
                    id="initial-supply"
                    type="text"
                    inputMode="numeric"
                    value={supply}
                    onChange={(e) => {
                      setSupply(
                        e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        )
                      );

                      resetStatus();
                    }}
                    placeholder="1000000"
                    disabled={
                      isDeploying
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-bold text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                  />

                  {supply && (
                    <p className="mt-2 text-[11px] font-semibold text-cyan-400/70">
                      Total supply:{" "}
                      {formatSupply(
                        supply
                      )}{" "}
                      {symbol ||
                        "tokens"}
                    </p>
                  )}
                </div>

                {/* DECIMALS */}

                <div className="mb-5">
                  <label
                    htmlFor="token-decimals"
                    className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45"
                  >
                    Decimals
                  </label>

                  <input
                    id="token-decimals"
                    type="number"
                    min="0"
                    max="18"
                    value={decimals}
                    onChange={(e) => {
                      setDecimals(
                        e.target.value
                      );

                      resetStatus();
                    }}
                    disabled={
                      isDeploying
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-bold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
                  />

                  <div className="mt-2 flex items-start gap-2">
                    <Info
                      size={13}
                      className="mt-0.5 shrink-0 text-white/25"
                    />

                    <p className="text-[11px] leading-4 text-white/25">
                      18 is the standard setting used
                      by most ERC-20 tokens.
                    </p>
                  </div>
                </div>

                {/* PREVIEW */}

                {(name ||
                  symbol ||
                  supply) && (
                  <div className="mb-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/60">
                      Token Preview
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-black">
                        {symbol
                          ? symbol.slice(
                              0,
                              3
                            )
                          : "TKN"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {name ||
                            "Your Token"}
                        </p>

                        <p className="mt-0.5 text-xs text-white/35">
                          {symbol ||
                            "TKN"}{" "}
                          ·{" "}
                          {supply
                            ? formatSupply(
                                supply
                              )
                            : "0"}{" "}
                          supply
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECURITY */}

                <div className="mb-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        Non-custodial deployment
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/35">
                        Your wallet signs the transaction.
                        IOPn DEX never receives your private key.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ARTIFACT */}

                {artifactLoading && (
                  <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/50">
                    <Loader2
                      size={18}
                      className="animate-spin text-cyan-400"
                    />

                    Preparing deployment...
                  </div>
                )}

                {artifactError && (
                  <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">
                    <div className="flex gap-3">
                      <XCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div>
                        <p className="text-sm font-bold text-red-300">
                          Deployment unavailable
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-300/70">
                          {artifactError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR */}

                {status ===
                  "error" &&
                  error && (
                    <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">
                      <div className="flex gap-3">
                        <AlertCircle
                          size={19}
                          className="mt-0.5 shrink-0 text-red-400"
                        />

                        <div>
                          <p className="text-sm font-bold text-red-300">
                            Something went wrong
                          </p>

                          <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* CONFIRMING */}

                {status ===
                  "confirming" &&
                  txHash && (
                    <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
                      <div className="flex items-start gap-3">
                        <Loader2
                          size={20}
                          className="mt-0.5 shrink-0 animate-spin text-cyan-400"
                        />

                        <div className="min-w-0">
                          <p className="font-bold">
                            Confirming deployment
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/35">
                            Confirm the transaction in your
                            wallet. Do not close this page.
                          </p>

                          <p className="mt-2 break-all font-mono text-[10px] text-white/20">
                            {txHash}
                          </p>

                          {transactionUrl && (
                            <a
                              href={
                                transactionUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-400"
                            >
                              View transaction
                              <ExternalLink
                                size={13}
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* DEPLOY BUTTON */}

                <button
                  type="submit"
                  disabled={
                    isDeploying ||
                    artifactLoading ||
                    !artifact ||
                    !isConnected
                  }
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-black text-[#020617] shadow-[0_10px_35px_rgba(34,211,238,.18)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeploying ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      {status ===
                      "loading"
                        ? "Preparing..."
                        : "Confirm in Wallet"}
                    </>
                  ) : (
                    <>
                      <Rocket
                        size={19}
                      />

                      Deploy Token
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[10px] leading-4 text-white/25">
                  You will review and confirm the
                  transaction in your wallet before the
                  token is created.
                </p>
              </div>
            </section>
          </form>
        )}

        {/* SUCCESS */}

        {hasDeployment &&
          contractAddress && (
            <section className="overflow-hidden rounded-[28px] border border-emerald-400/20 bg-emerald-400/[0.035] shadow-[0_25px_80px_rgba(0,0,0,.35)]">

              {/* SUCCESS HEADER */}

              <div className="border-b border-white/[0.07] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10">
                    <CheckCircle2
                      size={25}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <p className="text-lg font-black text-emerald-300">
                      Token Created!
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Your token is now deployed on
                      IOPn Testnet.
                    </p>
                  </div>
                </div>

                {/* TOKEN SUMMARY */}

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/25">
                      Token
                    </p>

                    <p className="mt-1 truncate text-xs font-black">
                      {name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-cyan-400">
                      {symbol}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/25">
                      Supply
                    </p>

                    <p className="mt-1 truncate text-xs font-black">
                      {formatSupply(
                        supply
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/30">
                      {decimals} decimals
                    </p>
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
                    Contract Address
                  </p>

                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 break-all font-mono text-[11px] font-bold text-white/75">
                      {contractAddress}
                    </p>

                    <button
                      type="button"
                      onClick={
                        copyAddress
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:text-cyan-400"
                    >
                      {copied ? (
                        <CheckCircle2
                          size={15}
                          className="text-emerald-400"
                        />
                      ) : (
                        <Copy
                          size={15}
                        />
                      )}
                    </button>
                  </div>

                  {copied && (
                    <p className="mt-2 text-[10px] font-bold text-emerald-400">
                      Contract address copied
                    </p>
                  )}
                </div>

                {/* LINKS */}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {contractUrl && (
                    <a
                      href={
                        contractUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold text-white/60 transition hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                      Contract
                      <ExternalLink
                        size={13}
                      />
                    </a>
                  )}

                  {transactionUrl && (
                    <a
                      href={
                        transactionUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-bold text-white/60 transition hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                      Transaction
                      <ExternalLink
                        size={13}
                      />
                    </a>
                  )}
                </div>
              </div>

              {/* VERIFICATION */}

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <FileCheck2
                      size={20}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <h3 className="font-black">
                      Contract Verification
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      We automatically submit your source
                      code for verification.
                    </p>
                  </div>
                </div>

                {/* VERIFICATION DETAILS */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/25">
                      Compiler
                    </p>

                    <p className="mt-1 break-all text-[10px] font-bold text-white/60">
                      {artifact?.compiler?.version ||
                        "Solidity 0.8.36"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/25">
                      Optimization
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-white/60">
                      {artifact?.optimization?.enabled ??
                      true
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>

                {renderVerification()}

                {/* MANUAL VERIFICATION */}

                <button
                  type="button"
                  onClick={
                    openManualVerification
                  }
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-sm font-black text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.1]"
                >
                  <FileCheck2
                    size={17}
                  />

                  Open Verification Page

                  <ExternalLink
                    size={14}
                  />
                </button>

                <p className="mt-2 text-center text-[10px] leading-4 text-white/20">
                  If automatic verification is still
                  processing, you can check the contract
                  manually from the explorer.
                </p>

                {/* CREATE ANOTHER */}

                <button
                  type="button"
                  onClick={
                    createAnotherToken
                  }
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
                >
                  <Rocket
                    size={17}
                  />

                  Create Another Token
                </button>
              </div>
            </section>
          )}

        {/* HELP */}

        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <Info
              size={18}
              className="mt-0.5 shrink-0 text-cyan-400/60"
            />

            <div>
              <p className="text-xs font-bold text-white/55">
                How it works
              </p>

              <div className="mt-2 space-y-1.5 text-[10px] leading-4 text-white/25">
                <p>
                  <span className="font-bold text-white/40">
                    1.
                  </span>{" "}
                  Enter your token information.
                </p>

                <p>
                  <span className="font-bold text-white/40">
                    2.
                  </span>{" "}
                  Click Deploy Token and confirm the
                  transaction in your wallet.
                </p>

                <p>
                  <span className="font-bold text-white/40">
                    3.
                  </span>{" "}
                  Your token contract is created on IOPn.
                </p>

                <p>
                  <span className="font-bold text-white/40">
                    4.
                  </span>{" "}
                  IOPn DEX automatically submits the
                  contract for verification.
                </p>

                <p>
                  <span className="font-bold text-white/40">
                    5.
                  </span>{" "}
                  If automatic verification takes longer,
                  you can open the explorer manually.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY FOOTER */}

        <div className="mt-3 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-white/25"
            />

            <p className="text-[10px] leading-4 text-white/20">
              Your wallet controls the deployment
              transaction. IOPn DEX does not receive or
              store your private key.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}