"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
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
  isAddress,
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

  compiler?: {
    name?: string;
    version?: string;
    fullVersion?: string;
  };

  compilerInput?: unknown;
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
  | "submitted"
  | "checking"
  | "verified"
  | "error";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const EXPLORER_API =
  `${EXPLORER_URL}/api/v2`;

const DEFAULT_DECIMALS = 18;

const CONTRACT_NAME =
  "IOPnToken";

const LICENSE_TYPE =
  "mit";

const VERIFICATION_POLL_INTERVAL =
  4000;

const VERIFICATION_MAX_ATTEMPTS =
  20;

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
     FORM STATE
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

  /*
   * EXACT constructor arguments used
   * during deployment.
   */
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
            `Could not load IOPnToken artifact (${response.status}).`
          );
        }

        const json =
          (await response.json()) as ContractArtifact;

        if (!json.abi) {
          throw new Error(
            "IOPnToken artifact does not contain an ABI."
          );
        }

        if (!json.bytecode) {
          throw new Error(
            "IOPnToken artifact does not contain deployment bytecode."
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
              : "Unable to load the token contract artifact."
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
     WAIT FOR DEPLOYMENT
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
     DEPLOYMENT STATE
  ======================================================= */

  const isDeploying =
    status === "loading" ||
    status === "confirming" ||
    isConfirming;

  /* =======================================================
     RESET
  ======================================================= */

  function resetStatus() {
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
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    if (
      !isConnected ||
      !address
    ) {
      return "Please connect your wallet first.";
    }

    if (!walletClient) {
      return "Wallet client is not ready. Please reconnect your wallet.";
    }

    if (!artifact) {
      return "Token contract artifact is not loaded yet.";
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

    if (
      trimmedName.length > 100
    ) {
      return "Token name is too long.";
    }

    if (!trimmedSymbol) {
      return "Enter a token symbol.";
    }

    if (
      !/^[A-Z0-9]{1,12}$/.test(
        trimmedSymbol
      )
    ) {
      return "Token symbol must contain 1–12 letters or numbers.";
    }

    if (!supply.trim()) {
      return "Enter the initial supply.";
    }

    if (
      !/^[0-9]+$/.test(
        supply.trim()
      )
    ) {
      return "Initial supply must contain whole numbers only.";
    }

    if (
      supply.trim() === "0"
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

    if (
      !isAddress(address)
    ) {
      return "Connected wallet address is invalid.";
    }

    return null;
  }

  /* =======================================================
     GET EXPLORER VERIFICATION STATUS
  ======================================================= */

  async function getVerificationStatus(
    deployedAddress: Address
  ) {
    const response =
      await fetch(
        `${EXPLORER_API}/smart-contracts/${deployedAddress}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return {
        verified: false,
        data: null,
      };
    }

    const data =
      await response.json();

    const verified =
      data?.is_fully_verified ===
        true ||
      data?.is_verified ===
        true;

    return {
      verified,
      data,
    };
  }

  /* =======================================================
     POLL VERIFICATION STATUS
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
        const result =
          await getVerificationStatus(
            deployedAddress
          );

        if (result.verified) {
          setVerificationStatus(
            "verified"
          );

          return true;
        }
      } catch (err) {
        console.warn(
          `Verification status check ${attempt} failed:`,
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

    /*
     * The request may still be processing.
     *
     * Do NOT call it a permanent failure.
     */
    setVerificationStatus(
      "submitted"
    );

    return false;
  }

  /* =======================================================
     AUTOMATIC VERIFICATION
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

      /* ---------------------------------------------------
         ENCODE EXACT CONSTRUCTOR ARGUMENTS
      --------------------------------------------------- */

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
        );

      /*
       * The explorer expects constructor arguments
       * without 0x.
       */
      const constructorArgsWithoutPrefix =
        encodedConstructorArgs.replace(
          /^0x/i,
          ""
        );

      /* ---------------------------------------------------
         LOAD EXACT STANDARD JSON INPUT
      --------------------------------------------------- */

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
          `Could not load Standard JSON Input (${standardInputResponse.status}).`
        );
      }

      const standardInput =
        await standardInputResponse.text();

      if (!standardInput.trim()) {
        throw new Error(
          "Standard JSON Input is empty."
        );
      }

      /* ---------------------------------------------------
         GET EXACT COMPILER VERSION
      --------------------------------------------------- */

      const compilerVersion =
        artifact?.compiler
          ?.fullVersion ||
        artifact?.compiler
          ?.version;

      if (!compilerVersion) {
        throw new Error(
          "Compiler version is missing from IOPnToken.json."
        );
      }

      /*
       * Your compile script stores the version as:
       *
       * v0.8.36+commit.xxxxxxxx
       *
       * Make sure it starts with v.
       */
      const normalizedCompilerVersion =
        compilerVersion.startsWith(
          "v"
        )
          ? compilerVersion
          : `v${compilerVersion}`;

      console.log(
        "===================================="
      );

      console.log(
        "AUTOMATIC TOKEN VERIFICATION"
      );

      console.log(
        "===================================="
      );

      console.log(
        "Contract:",
        deployedAddress
      );

      console.log(
        "Compiler:",
        normalizedCompilerVersion
      );

      console.log(
        "Constructor args bytes:",
        constructorArgsWithoutPrefix.length /
          2
      );

      console.log(
        "Constructor args:",
        constructorArgsWithoutPrefix
      );

      /* ---------------------------------------------------
         CALL OUR NEXT.JS VERIFICATION API
      --------------------------------------------------- */

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

              compilerVersion:
                normalizedCompilerVersion,

              contractName:
                CONTRACT_NAME,

              licenseType:
                LICENSE_TYPE,

              standardInput,

              constructorArgs:
                constructorArgsWithoutPrefix,

              autodetectConstructorArgs:
                false,
            }),
          }
        );

      const result =
        await response.json();

      console.log(
        "Verification API response:",
        result
      );

      if (
        !response.ok ||
        result?.success !==
          true
      ) {
        throw new Error(
          result?.error ||
            result?.message ||
            result?.explorerResponse
              ?.message ||
            "Explorer verification submission failed."
        );
      }

      /*
       * The explorer accepted the submission.
       */
      setVerificationStatus(
        "submitted"
      );

      /*
       * If our API already knows that it is verified,
       * immediately show verified.
       */
      if (
        result?.verified ===
        true
      ) {
        setVerificationStatus(
          "verified"
        );

        return;
      }

      /*
       * Otherwise wait for explorer processing.
       */
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
    }
  }

  /* =======================================================
     DEPLOY
  ======================================================= */

  async function handleDeploy(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setContractAddress(undefined);
    setTxHash(undefined);

    setVerificationStatus(
      "idle"
    );

    setVerificationError("");

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

      /*
       * Convert human-readable supply
       * into ERC-20 base units.
       */
      const initialSupply =
        parseUnits(
          supply.trim(),
          decimalsNumber
        );

      /*
       * EXACT constructor used by IOPnToken.
       */
      const constructorArgs = [
        trimmedName,
        trimmedSymbol,
        initialSupply,
        decimalsNumber,
        address,
      ] as const;

      /*
       * Save exact arguments BEFORE deployment.
       */
      setDeploymentConstructorArgs(
        constructorArgs
      );

      /*
       * Deploy.
       */
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
     DEPLOYMENT RECEIPT
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

    /*
     * Verification MUST use the exact
     * constructor arguments from deployment.
     */
    if (
      !deploymentConstructorArgs
    ) {
      setVerificationStatus(
        "error"
      );

      setVerificationError(
        "Deployment succeeded, but the exact constructor arguments were not available for verification."
      );

      return;
    }

    verifyContract(
      deployedAddress,
      deploymentConstructorArgs
    );

    // Intentionally reacts to deployment receipt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConfirmed,
    receipt,
  ]);

  /* =======================================================
     COPY ADDRESS
  ======================================================= */

  async function copyAddress() {
    if (
      !contractAddress
    ) {
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

  function renderVerificationStatus() {
    if (
      verificationStatus ===
      "loading"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Starting automatic verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Sending the exact compiler input,
                compiler version and constructor
                arguments to the IOPn Explorer.
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
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Verification submitted
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                The explorer accepted the request.
                It may still be processing the
                verification.
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
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Checking verification status
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Waiting for the explorer to confirm
                that the deployed bytecode is verified.
              </p>

              <p className="mt-2 text-[10px] text-white/25">
                This can take a little longer than
                the deployment transaction.
              </p>
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
                Your token source code is now
                verified on the IOPn Explorer.
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
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0">
              <p className="font-bold text-red-300">
                Automatic verification failed
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                {verificationError}
              </p>

              <p className="mt-2 text-xs leading-5 text-red-300/50">
                The token deployment itself was
                successful. You can open the explorer
                to inspect the contract.
              </p>
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
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Rocket
                size={24}
                className="text-cyan-400"
                strokeWidth={2.2}
              />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Deploy Token
              </h1>

              <p className="text-sm text-white/45">
                Create and automatically verify your
                ERC-20 token on IOPn Testnet
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Network
              </p>

              <p className="mt-1 text-sm font-bold">
                IOPn Testnet
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

              <span className="text-xs font-bold text-emerald-400">
                Chain {chainId}
              </span>
            </div>
          </div>
        </div>

        {/* WALLET */}

        <div className="mb-5 rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,.3)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
              <Wallet size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                Deployment Wallet
              </p>

              {isConnected &&
              address ? (
                <p className="mt-1 truncate font-bold">
                  {address.slice(0, 8)}
                  ...
                  {address.slice(-6)}
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-red-400">
                  Wallet not connected
                </p>
              )}
            </div>

            {isConnected && (
              <CheckCircle2
                size={20}
                className="shrink-0 text-emerald-400"
              />
            )}
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={handleDeploy}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_25px_80px_rgba(0,0,0,.35)] backdrop-blur-xl">

            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="relative space-y-5">

              {/* NAME */}

              <div>
                <label
                  htmlFor="token-name"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45"
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
                  disabled={isDeploying}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />
              </div>

              {/* SYMBOL */}

              <div>
                <label
                  htmlFor="token-symbol"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45"
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
                  placeholder="TST"
                  disabled={isDeploying}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-semibold uppercase text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />
              </div>

              {/* SUPPLY */}

              <div>
                <label
                  htmlFor="initial-supply"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45"
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
                  disabled={isDeploying}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />

                <p className="mt-2 text-xs text-white/30">
                  Example: 1,000,000 tokens
                </p>
              </div>

              {/* DECIMALS */}

              <div>
                <label
                  htmlFor="token-decimals"
                  className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45"
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
                  disabled={isDeploying}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-[#070b16] px-4 text-base font-semibold text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />

                <p className="mt-2 text-xs text-white/30">
                  Standard ERC-20 setting: 18
                </p>
              </div>

              {/* SECURITY */}

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-cyan-400"
                  />

                  <div>
                    <p className="text-sm font-bold">
                      Secure token deployment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/40">
                      Your connected wallet becomes
                      the initial owner of the deployed
                      token contract.
                    </p>
                  </div>
                </div>
              </div>

              {/* ARTIFACT LOADING */}

              {artifactLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/50">
                  <Loader2
                    size={18}
                    className="animate-spin text-cyan-400"
                  />

                  Loading token contract...
                </div>
              )}

              {/* ARTIFACT ERROR */}

              {artifactError && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300">
                  <div className="flex gap-3">
                    <XCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="font-bold">
                        Contract artifact unavailable
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-300/70">
                        {artifactError}
                      </p>

                      <code className="mt-2 block text-[11px] text-red-300/70">
                        public/artifacts/IOPnToken.json
                      </code>

                      <code className="mt-1 block text-[11px] text-red-300/70">
                        public/artifacts/IOPnToken-standard-input.json
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* DEPLOYMENT ERROR */}

              {status ===
                "error" &&
                error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-300">
                    <div className="flex gap-3">
                      <XCircle
                        size={19}
                        className="mt-0.5 shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="font-bold">
                          Deployment failed
                        </p>

                        <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* CONFIRMATION */}

              {status ===
                "confirming" &&
                txHash && (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
                    <div className="flex items-start gap-3">
                      <Loader2
                        size={20}
                        className="mt-0.5 animate-spin text-cyan-400"
                      />

                      <div className="min-w-0">
                        <p className="font-bold">
                          Waiting for confirmation
                        </p>

                        <p className="mt-1 break-all text-xs text-white/40">
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
                              size={14}
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* SUCCESS */}

              {status ===
                "success" &&
                contractAddress && (
                  <div className="overflow-hidden rounded-[24px] border border-emerald-400/20 bg-emerald-400/[0.045]">

                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                          <CheckCircle2
                            size={21}
                            className="text-emerald-400"
                          />
                        </div>

                        <div>
                          <p className="font-black text-emerald-300">
                            Token deployed successfully
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            Your ERC-20 token has been
                            deployed successfully on
                            IOPn Testnet.
                          </p>
                        </div>
                      </div>

                      {/* ADDRESS */}

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
                          Contract Address
                        </p>

                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 break-all text-xs font-bold text-white/80">
                            {contractAddress}
                          </p>

                          <button
                            type="button"
                            onClick={
                              copyAddress
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:text-cyan-400"
                          >
                            <Copy
                              size={15}
                            />
                          </button>
                        </div>

                        {copied && (
                          <p className="mt-2 text-[11px] font-bold text-emerald-400">
                            Address copied
                          </p>
                        )}
                      </div>

                      {/* EXPLORER LINKS */}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {contractUrl && (
                          <a
                            href={
                              contractUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-cyan-400/30 hover:text-cyan-400"
                          >
                            View Contract

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
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-cyan-400/30 hover:text-cyan-400"
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

                    <div className="border-t border-white/[0.07] bg-white/[0.02] p-5">
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

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            IOPn DEX automatically submits
                            the exact Solidity source,
                            compiler settings and constructor
                            arguments used by this deployment.
                          </p>
                        </div>
                      </div>

                      {/* COMPILER */}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] text-white/30">
                            Compiler
                          </p>

                          <p className="mt-1 text-[11px] font-bold text-white/70">
                            {artifact?.compiler
                              ?.fullVersion ||
                              "Solidity 0.8.36"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] text-white/30">
                            Optimization
                          </p>

                          <p className="mt-1 text-[11px] font-bold text-white/70">
                            Enabled · 200 runs
                          </p>
                        </div>
                      </div>

                      {renderVerificationStatus()}

                      {/* EXPLORER */}

                      <a
                        href={
                          verificationUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-black text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/15 active:scale-[0.98]"
                      >
                        <FileCheck2
                          size={18}
                        />

                        Open Contract on Explorer

                        <ExternalLink
                          size={15}
                        />
                      </a>

                      {verificationStatus ===
                        "submitted" && (
                        <p className="mt-3 text-center text-[10px] leading-4 text-white/25">
                          The verification request was
                          accepted. The explorer may take
                          longer to finish processing it.
                        </p>
                      )}
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
                      ? "Preparing Deployment..."
                      : "Confirming Deployment..."}
                  </>
                ) : (
                  <>
                    <Rocket size={19} />

                    Deploy Token
                  </>
                )}
              </button>

              <p className="text-center text-[11px] leading-5 text-white/25">
                Deployment requires a wallet transaction
                and network gas. After confirmation,
                IOPn DEX automatically submits the contract
                for explorer verification.
              </p>
            </div>
          </div>
        </form>

        {/* FOOTER */}

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-white/30"
            />

            <div>
              <p className="text-xs font-bold text-white/60">
                About verification
              </p>

              <p className="mt-1 text-[11px] leading-5 text-white/30">
                Verification publishes the source code,
                ABI, compiler settings and constructor
                information associated with your deployed
                bytecode. It does not modify the deployed
                contract or its permissions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}