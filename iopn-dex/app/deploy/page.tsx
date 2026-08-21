"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  Download,
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
  | "waiting-contract"
  | "submitted"
  | "checking"
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

const CONTRACT_READY_INTERVAL = 2000;
const CONTRACT_READY_MAX_ATTEMPTS = 20;

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
    copiedField,
    setCopiedField,
  ] = useState<
    "address" |
    "tx" |
    "constructor" |
    null
  >(null);

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
     WAIT FOR TRANSACTION RECEIPT
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
      : `${EXPLORER_URL}/verify-contract`;

  /* =======================================================
     DEPLOYING
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

    setCopiedField(null);

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
     WAIT FOR EXPLORER CONTRACT
  ======================================================= */

  async function waitForExplorerContract(
    deployedAddress: Address
  ) {
    setVerificationStatus(
      "waiting-contract"
    );

    for (
      let attempt = 1;
      attempt <=
      CONTRACT_READY_MAX_ATTEMPTS;
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
            data?.isContract === true ||
            data?.contract === true ||
            data?.exists === true
          ) {
            return true;
          }
        }
      } catch (err) {
        console.warn(
          "Explorer contract check failed:",
          err
        );
      }

      if (
        attempt <
        CONTRACT_READY_MAX_ATTEMPTS
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              CONTRACT_READY_INTERVAL
            )
        );
      }
    }

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

      const explorerReady =
        await waitForExplorerContract(
          deployedAddress
        );

      if (!explorerReady) {
        throw new Error(
          "The IOPn Explorer has not indexed the contract yet. You can verify it manually using the Standard JSON file below."
        );
      }

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
          "Could not load IOPnToken-standard-input.json."
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

        if (
          response.ok
        ) {
          const data =
            await response.json();

          if (
            data?.verified === true ||
            data?.isVerified === true ||
            data?.isFullyVerified ===
              true
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

    if (
      !deploymentConstructorArgs
    ) {
      setVerificationStatus(
        "error"
      );

      setVerificationError(
        "Deployment succeeded, but the exact constructor arguments were unavailable."
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
     COPY
  ======================================================= */

  async function copyText(
    value: string,
    field:
      | "address"
      | "tx"
      | "constructor"
  ) {
    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedField(field);

      setTimeout(
        () => {
          setCopiedField(null);
        },
        1800
      );
    } catch {
      setCopiedField(null);
    }
  }

  /* =======================================================
     CONSTRUCTOR ARGUMENTS
  ======================================================= */

  function getConstructorArgumentsText() {
    if (
      !deploymentConstructorArgs
    ) {
      return "";
    }

    const encoded =
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
        deploymentConstructorArgs
      );

    return encoded.replace(
      /^0x/,
      ""
    );
  }

  /* =======================================================
     DOWNLOAD STANDARD JSON
  ======================================================= */

  function downloadStandardJson() {
    const link =
      document.createElement(
        "a"
      );

    link.href =
      "/artifacts/IOPnToken-standard-input.json";

    link.download =
      "IOPnToken-standard-input.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  /* =======================================================
     DOWNLOAD VERIFICATION INFO
  ======================================================= */

  function downloadVerificationInfo() {
    if (
      !contractAddress
    ) {
      return;
    }

    const constructorArgs =
      getConstructorArgumentsText();

    const compiler =
      artifact?.compiler?.version ||
      "v0.8.36+commit.8a079791";

    const optimizationRuns =
      artifact?.optimization?.runs ||
      200;

    const content = `IOPn Token Manual Verification Information

Contract Name:
${CONTRACT_NAME}

Contract Address:
${contractAddress}

Transaction Hash:
${txHash || "Unavailable"}

Compiler:
${compiler}

Optimization:
Enabled

Optimization Runs:
${optimizationRuns}

License:
MIT

Constructor Arguments:
${constructorArgs}

Standard JSON Input:
IOPnToken-standard-input.json

Explorer:
${contractUrl}

Verification Page:
${verificationUrl}
`;

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${CONTRACT_NAME}-verification-info.txt`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
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
                Preparing automatic verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Preparing the exact compiler input and
                constructor arguments used by this deployment.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "waiting-contract"
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
                Waiting for explorer indexing
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Your transaction is confirmed. We are
                waiting for the IOPn Explorer to recognize
                the new contract.
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
                The explorer accepted the verification
                request. It may take a little longer to
                display the verified source.
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
                Waiting for the explorer to confirm that
                the deployed bytecode matches the source.
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
                Your token source code is now verified on
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
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0">
              <p className="font-bold text-red-300">
                Automatic verification needs attention
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                {verificationError}
              </p>

              <p className="mt-2 text-xs leading-5 text-red-300/50">
                Your token deployment itself was successful.
                You can use the manual verification tools below.
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
                Create and verify your ERC-20 token on
                IOPn Testnet
              </p>
            </div>
          </div>

          {/* NETWORK */}

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
                      Your connected wallet becomes the
                      initial owner of the deployed token
                      contract.
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
                      </div>
                    </div>
                  </div>
                )}

              {/* SUCCESS */}

              {status ===
                "success" &&
                contractAddress && (
                  <div className="overflow-hidden rounded-[24px] border border-emerald-400/20 bg-emerald-400/[0.045]">

                    {/* DEPLOYED */}

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
                            Your ERC-20 token is now deployed on
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
                            onClick={() =>
                              copyText(
                                contractAddress,
                                "address"
                              )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:text-cyan-400"
                          >
                            {copiedField ===
                            "address" ? (
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

                        {copiedField ===
                          "address" && (
                          <p className="mt-2 text-[11px] font-bold text-emerald-400">
                            Address copied
                          </p>
                        )}
                      </div>

                      {/* LINKS */}

                      <div className="mt-3 flex flex-wrap gap-2">
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
                      </div>

                      {/* CONSTRUCTOR */}

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
                              Constructor Arguments
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              ABI-encoded values used during deployment
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                getConstructorArgumentsText(),
                                "constructor"
                              )
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 hover:text-cyan-400"
                          >
                            {copiedField ===
                            "constructor" ? (
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

                        <p className="mt-3 max-h-24 overflow-auto break-all rounded-xl bg-black/30 p-3 font-mono text-[9px] leading-4 text-white/40">
                          {getConstructorArgumentsText()}
                        </p>

                        {copiedField ===
                          "constructor" && (
                          <p className="mt-2 text-[11px] font-bold text-emerald-400">
                            Constructor arguments copied
                          </p>
                        )}
                      </div>
                    </div>

                    {/* AUTOMATIC VERIFICATION */}

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
                            Automatic Verification
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            IOPn DEX automatically submits the exact
                            compiler input and constructor arguments
                            used by this deployment.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] text-white/30">
                            Compiler
                          </p>

                          <p className="mt-1 break-all text-[11px] font-bold text-white/70">
                            {artifact?.compiler?.version ||
                              "v0.8.36+commit.8a079791"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <p className="text-[10px] text-white/30">
                            Optimization
                          </p>

                          <p className="mt-1 text-[11px] font-bold text-white/70">
                            Enabled ·{" "}
                            {artifact?.optimization?.runs ||
                              200}{" "}
                            runs
                          </p>
                        </div>
                      </div>

                      {renderVerificationStatus()}
                    </div>

                    {/* MANUAL VERIFICATION */}

                    <div className="border-t border-white/[0.07] bg-[#060a14] p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10">
                          <FileCheck2
                            size={20}
                            className="text-violet-400"
                          />
                        </div>

                        <div>
                          <h3 className="font-black">
                            Manual Verification
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            If automatic verification does not finish,
                            verify your contract manually using the
                            exact Standard JSON Input used during
                            deployment.
                          </p>
                        </div>
                      </div>

                      {/* QUICK INFO */}

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-3">
                          <span className="text-xs text-white/40">
                            Compiler
                          </span>

                          <span className="text-xs font-bold text-white/75">
                            {artifact?.compiler?.version ||
                              "v0.8.36+commit.8a079791"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-3">
                          <span className="text-xs text-white/40">
                            Optimization
                          </span>

                          <span className="text-xs font-bold text-white/75">
                            Enabled ·{" "}
                            {artifact?.optimization?.runs ||
                              200}{" "}
                            runs
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-3">
                          <span className="text-xs text-white/40">
                            License
                          </span>

                          <span className="text-xs font-bold uppercase text-white/75">
                            MIT
                          </span>
                        </div>
                      </div>

                      {/* STANDARD JSON */}

                      <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                        <div className="flex items-start gap-3">
                          <Download
                            size={20}
                            className="mt-0.5 shrink-0 text-cyan-400"
                          />

                          <div className="min-w-0">
                            <p className="font-bold">
                              Standard JSON Input
                            </p>

                            <p className="mt-1 text-xs leading-5 text-white/40">
                              This is the exact compiler input generated
                              for your token deployment. Upload this
                              file to the IOPn Explorer verification page.
                            </p>

                            <code className="mt-3 block truncate rounded-xl bg-black/30 px-3 py-2 text-[10px] text-cyan-300/70">
                              IOPnToken-standard-input.json
                            </code>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={
                            downloadStandardJson
                          }
                          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 text-sm font-black text-black transition hover:bg-cyan-300 active:scale-[0.98]"
                        >
                          <Download
                            size={17}
                          />

                          Download Standard JSON
                        </button>
                      </div>

                      {/* VERIFICATION INFO */}

                      <button
                        type="button"
                        onClick={
                          downloadVerificationInfo
                        }
                        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white/70 transition hover:border-cyan-400/30 hover:text-cyan-300"
                      >
                        <Download
                          size={17}
                        />

                        Download Verification Info
                      </button>

                      {/* STEPS */}

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                          Manual Verification Steps
                        </p>

                        <div className="mt-4 space-y-4">

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              1
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Open the contract
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Open your deployed contract on
                                the IOPn Explorer.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              2
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Select Verify & Publish
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Select the contract verification
                                option.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              3
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Choose Standard JSON
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Select{" "}
                                <span className="font-bold text-white/60">
                                  Solidity (Standard JSON input)
                                </span>
                                .
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              4
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Select compiler
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Use{" "}
                                <span className="font-bold text-white/60">
                                  {artifact?.compiler?.version ||
                                    "v0.8.36+commit.8a079791"}
                                </span>
                                .
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              5
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Upload the JSON file
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Upload the downloaded{" "}
                                <span className="font-bold text-white/60">
                                  IOPnToken-standard-input.json
                                </span>{" "}
                                file.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-400">
                              6
                            </div>

                            <div>
                              <p className="text-sm font-bold">
                                Submit verification
                              </p>

                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Confirm MIT license and submit
                                the verification request.
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* EXPLORER BUTTON */}

                      <a
                        href={
                          verificationUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-400 to-cyan-400 text-sm font-black text-[#020617] shadow-[0_10px_35px_rgba(34,211,238,.12)] transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <FileCheck2
                          size={18}
                        />

                        Verify on IOPn Explorer

                        <ExternalLink
                          size={15}
                        />
                      </a>

                      <p className="mt-3 text-center text-[10px] leading-4 text-white/25">
                        Your deployed contract address, compiler
                        settings and Standard JSON file must match
                        the original deployment.
                      </p>
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
                    <Rocket
                      size={19}
                    />

                    Deploy Token
                  </>
                )}
              </button>

              <p className="text-center text-[11px] leading-5 text-white/25">
                Deployment requires a wallet transaction and
                network gas. After confirmation, IOPn DEX
                automatically attempts verification.
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