"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  Loader2,
  RefreshCw,
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
  | "waiting-contract"
  | "submitted"
  | "checking"
  | "verified"
  | "manual"
  | "error";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const DEFAULT_DECIMALS = 18;

const CONTRACT_NAME = "IOPnToken";

const LICENSE_TYPE = "mit";

const STATUS_POLL_INTERVAL = 5000;

/*
 * 30 × 5 seconds = approximately 2.5 minutes.
 *
 * We do NOT claim verification after these attempts.
 * We switch to manual/check-again mode instead.
 */
const STATUS_MAX_ATTEMPTS = 30;

/* =========================================================
   COMPONENT
========================================================= */

export default function DeployPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const chainId = useChainId();

  const {
    data: walletClient,
  } = useWalletClient();

  /* =======================================================
     FORM
  ======================================================= */

  const [name, setName] = useState("");

  const [symbol, setSymbol] = useState("");

  const [supply, setSupply] = useState("");

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

  const [status, setStatus] =
    useState<DeployStatus>("idle");

  const [error, setError] =
    useState("");

  const [txHash, setTxHash] =
    useState<Hex | undefined>();

  const [
    contractAddress,
    setContractAddress,
  ] = useState<Address | undefined>();

  const [copied, setCopied] =
    useState(false);

  const [
    deploymentConstructorArgs,
    setDeploymentConstructorArgs,
  ] = useState<ConstructorArgs | null>(
    null
  );

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
    verificationMessage,
    setVerificationMessage,
  ] = useState("");

  const [
    verificationAttempts,
    setVerificationAttempts,
  ] = useState(0);

  const [
    checkingAgain,
    setCheckingAgain,
  ] = useState(false);

  /*
   * Prevent duplicate automatic verification calls.
   */
  const verificationRunning =
    useRef(false);

  /* =======================================================
     LOAD ARTIFACT
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadArtifact() {
      try {
        setArtifactLoading(true);
        setArtifactError("");

        /*
         * The artifact is NOT served from public/.
         *
         * Server route reads:
         *
         * artifacts/IOPnToken.json
         */
        const response =
          await fetch(
            "/api/verify?artifact=true",
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.error ||
              "Could not load token artifact."
          );
        }

        const json =
          result.artifact as ContractArtifact;

        if (!json?.abi) {
          throw new Error(
            "IOPnToken artifact does not contain an ABI."
          );
        }

        if (!json?.bytecode) {
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
              : "Unable to load token contract artifact."
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

  /*
   * This sends the user to the explorer contract page.
   *
   * Depending on the explorer UI, the user can use
   * the Contract / Verify & Publish section there.
   */
  const manualVerificationUrl =
    verificationUrl || EXPLORER_URL;

  /* =======================================================
     DEPLOYING
  ======================================================= */

  const isDeploying =
    status === "loading" ||
    status === "confirming" ||
    isConfirming;

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

    return null;
  }

  /* =======================================================
     CHECK VERIFICATION
  ======================================================= */

  const checkVerification =
    useCallback(
      async (
        addressToCheck: Address,
        showChecking = true
      ): Promise<boolean> => {
        try {
          if (showChecking) {
            setVerificationStatus(
              "checking"
            );
          }

          setVerificationError("");

          const response =
            await fetch(
              `/api/verify?address=${addressToCheck}&_=${Date.now()}`,
              {
                method: "GET",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                  "Cache-Control":
                    "no-cache",
                },
              }
            );

          const result =
            await response.json();

          /*
           * CRITICAL:
           *
           * We only display VERIFIED when the server
           * explicitly returns:
           *
           * verified === true
           *
           * Submission is NOT verification.
           */
          if (
            response.ok &&
            result?.verified === true
          ) {
            setVerificationStatus(
              "verified"
            );

            setVerificationMessage(
              "The IOPn Explorer confirms that the contract source code is verified."
            );

            setVerificationError("");

            return true;
          }

          /*
           * The contract is known by the explorer,
           * but source verification is not confirmed.
           */
          if (
            response.ok &&
            result?.indexed === true
          ) {
            setVerificationStatus(
              "submitted"
            );

            setVerificationMessage(
              "The explorer knows this contract, but source-code verification has not been confirmed yet."
            );

            return false;
          }

          /*
           * Explorer has not indexed the contract.
           */
          if (
            response.ok &&
            result?.indexed === false
          ) {
            setVerificationStatus(
              "waiting-contract"
            );

            setVerificationMessage(
              "The contract is deployed, but the explorer has not indexed it yet."
            );

            return false;
          }

          setVerificationStatus(
            "manual"
          );

          setVerificationMessage(
            "The explorer did not confirm source-code verification."
          );

          return false;
        } catch (err) {
          console.error(
            "Verification check failed:",
            err
          );

          setVerificationStatus(
            "manual"
          );

          setVerificationError(
            err instanceof Error
              ? err.message
              : "Unable to check verification status."
          );

          setVerificationMessage(
            "The contract is deployed successfully, but verification could not be confirmed automatically."
          );

          return false;
        }
      },
      []
    );

  /* =======================================================
     AUTOMATIC VERIFICATION
  ======================================================= */

  async function verifyContract(
    deployedAddress: Address,
    constructorArgs: ConstructorArgs
  ) {
    if (
      verificationRunning.current
    ) {
      return;
    }

    verificationRunning.current =
      true;

    try {
      setVerificationStatus(
        "loading"
      );

      setVerificationError("");
      setVerificationMessage("");
      setVerificationAttempts(0);

      /*
       * =====================================================
       * ENCODE EXACT CONSTRUCTOR ARGUMENTS
       * =====================================================
       *
       * IOPnToken constructor:
       *
       * string
       * string
       * uint256
       * uint8
       * address
       */
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
          [
            constructorArgs[0],
            constructorArgs[1],
            constructorArgs[2],
            constructorArgs[3],
            constructorArgs[4],
          ]
        ).replace(
          /^0x/,
          ""
        );

      /*
       * =====================================================
       * LOAD STANDARD JSON
       * =====================================================
       */

      const standardInputResponse =
        await fetch(
          "/api/verify?standardInput=true",
          {
            cache: "no-store",
          }
        );

      const standardInputResult =
        await standardInputResponse.json();

      if (
        !standardInputResponse.ok ||
        !standardInputResult?.success
      ) {
        throw new Error(
          standardInputResult?.error ||
            "Could not load Standard JSON compiler input."
        );
      }

      const standardInput =
        standardInputResult.standardInput;

      if (
        typeof standardInput !==
          "string" ||
        !standardInput.trim()
      ) {
        throw new Error(
          "Standard JSON compiler input is empty."
        );
      }

      const compilerVersion =
        artifact?.compiler?.version ||
        "v0.8.36+commit.8a079791";

      const optimizationEnabled =
        artifact?.optimization?.enabled ??
        true;

      const optimizationRuns =
        artifact?.optimization?.runs ??
        200;

      /*
       * =====================================================
       * FIRST CHECK
       * =====================================================
       *
       * Maybe the user already manually verified it.
       */
      const alreadyVerified =
        await checkVerification(
          deployedAddress,
          true
        );

      if (
        alreadyVerified
      ) {
        return;
      }

      /*
       * =====================================================
       * SUBMIT VERIFICATION
       * =====================================================
       */

      setVerificationStatus(
        "submitted"
      );

      setVerificationMessage(
        "Submitting the exact Standard JSON source and constructor information to the IOPn Explorer..."
      );

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

      /*
       * =====================================================
       * IMPORTANT
       *
       * "submitted" is NOT "verified".
       * =====================================================
       */

      if (
        result?.verified === true
      ) {
        setVerificationStatus(
          "verified"
        );

        setVerificationMessage(
          "The IOPn Explorer confirms that the contract source code is verified."
        );

        return;
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.error ||
            result?.message ||
            "Explorer rejected the verification request."
        );
      }

      if (
        result?.waitingForIndexing
      ) {
        setVerificationStatus(
          "waiting-contract"
        );

        setVerificationMessage(
          "The contract is deployed, but the explorer is still indexing it."
        );
      } else {
        setVerificationStatus(
          "submitted"
        );

        setVerificationMessage(
          "Verification was submitted successfully. The explorer has not yet confirmed that the source is verified."
        );
      }

      /*
       * =====================================================
       * POLLING
       * =====================================================
       */

      for (
        let attempt = 1;
        attempt <=
        STATUS_MAX_ATTEMPTS;
        attempt++
      ) {
        setVerificationAttempts(
          attempt
        );

        await new Promise<void>(
          (resolve) =>
            setTimeout(
              resolve,
              STATUS_POLL_INTERVAL
            )
        );

        /*
         * Never automatically mark verified here.
         *
         * Only the server's verified:true response
         * can change the UI to verified.
         */
        const verified =
          await checkVerification(
            deployedAddress,
            false
          );

        if (
          verified
        ) {
          return;
        }

        /*
         * Restore submitted status after each check
         * unless explorer says it is still indexing.
         */
        if (
          verificationStatus !==
            "waiting-contract" &&
          verificationStatus !==
            "verified"
        ) {
          setVerificationStatus(
            "submitted"
          );
        }
      }

      /*
       * =====================================================
       * MANUAL FALLBACK
       * =====================================================
       */

      setVerificationStatus(
        "manual"
      );

      setVerificationMessage(
        "The explorer has not confirmed verification yet. You can verify manually or check again without redeploying."
      );
    } catch (err) {
      console.error(
        "Automatic verification failed:",
        err
      );

      setVerificationStatus(
        "manual"
      );

      setVerificationError(
        err instanceof Error
          ? err.message
          : "Automatic verification failed."
      );

      setVerificationMessage(
        "Your token is deployed successfully. Verification can be checked again or completed manually on the explorer."
      );
    } finally {
      verificationRunning.current =
        false;
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

    setContractAddress(
      undefined
    );

    setTxHash(undefined);

    setVerificationStatus(
      "idle"
    );

    setVerificationError("");

    setVerificationMessage("");

    setVerificationAttempts(0);

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

      /*
       * Explicit 5-element tuple.
       *
       * This also prevents the TypeScript error:
       *
       * any[] is not assignable to readonly [...]
       */
      const constructorArgs: ConstructorArgs =
        [
          trimmedName,
          trimmedSymbol,
          initialSupply,
          decimalsNumber,
          address,
        ];

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
        "manual"
      );

      setVerificationError(
        "Deployment succeeded, but the exact constructor arguments were unavailable."
      );

      setVerificationMessage(
        "The token is deployed. Verify it manually or check the explorer."
      );

      return;
    }

    void verifyContract(
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
     MANUAL CHECK
  ======================================================= */

  async function handleCheckAgain() {
    if (
      !contractAddress ||
      checkingAgain
    ) {
      return;
    }

    setCheckingAgain(true);

    setVerificationError("");

    setVerificationAttempts(0);

    try {
      /*
       * This is the only operation that can turn
       * the UI into "verified" after manual verification.
       */
      const verified =
        await checkVerification(
          contractAddress,
          true
        );

      if (
        verified
      ) {
        return;
      }

      setVerificationStatus(
        "manual"
      );

      setVerificationMessage(
        "The explorer still does not confirm that this contract's source code is verified."
      );
    } finally {
      setCheckingAgain(false);
    }
  }

  /* =======================================================
     RESET
  ======================================================= */

  function resetStatus() {
    if (isDeploying) {
      return;
    }

    verificationRunning.current =
      false;

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

    setVerificationMessage("");

    setVerificationAttempts(0);
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
                Preparing verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Preparing the exact compiler input,
                deployment bytecode and constructor
                arguments used by this deployment.
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
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Loader2
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-amber-400"
            />

            <div className="min-w-0">
              <p className="font-bold text-amber-300">
                Waiting for explorer indexing
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Your token is already deployed. The
                explorer has not finished indexing the
                contract yet.
              </p>

              {verificationAttempts >
                0 && (
                <p className="mt-2 text-[10px] text-white/25">
                  Checking...{" "}
                  {verificationAttempts}/
                  {STATUS_MAX_ATTEMPTS}
                </p>
              )}
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

            <div className="min-w-0 flex-1">
              <p className="font-bold text-cyan-300">
                Verification submitted
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                {verificationMessage ||
                  "The explorer has received the verification request. This does not mean the contract is verified yet."}
              </p>

              {verificationAttempts >
                0 && (
                <p className="mt-2 text-[10px] text-white/25">
                  Checking explorer...{" "}
                  {verificationAttempts}/
                  {STATUS_MAX_ATTEMPTS}
                </p>
              )}
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
            <RefreshCw
              size={20}
              className="mt-0.5 shrink-0 animate-spin text-cyan-400"
            />

            <div>
              <p className="font-bold">
                Checking verification
              </p>

              <p className="mt-1 text-xs leading-5 text-white/40">
                Checking the current source verification
                status from the explorer.
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

            <div className="min-w-0">
              <p className="font-black text-emerald-300">
                Contract verified
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                The IOPn Explorer has confirmed that the
                source code for this contract is verified.
              </p>

              {verificationUrl && (
                <a
                  href={
                    verificationUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300"
                >
                  View verified contract
                  <ExternalLink
                    size={13}
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (
      verificationStatus ===
      "manual"
    ) {
      return (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <FileCheck2
              size={21}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div className="min-w-0 flex-1">
              <p className="font-black text-amber-300">
                Verification not confirmed
              </p>

              <p className="mt-1 text-xs leading-5 text-white/45">
                {verificationMessage ||
                  verificationError ||
                  "The explorer has not confirmed source-code verification yet."}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={
                    handleCheckAgain
                  }
                  disabled={
                    checkingAgain
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingAgain ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={15}
                    />
                  )}

                  Check Verification Again
                </button>

                <a
                  href={
                    manualVerificationUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-white/70 transition hover:border-cyan-400/30 hover:text-cyan-400"
                >
                  Verify Manually
                  <ExternalLink
                    size={14}
                  />
                </a>
              </div>

              {verificationError && (
                <p className="mt-3 break-words text-[10px] leading-4 text-red-300/60">
                  {verificationError}
                </p>
              )}
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
                Verification error
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-red-300/70">
                {verificationError}
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

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            WALLET
        ================================================= */}

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

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleDeploy}
        >
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

                    if (
                      !isDeploying
                    ) {
                      setError("");
                    }
                  }}
                  placeholder="My Token"
                  disabled={
                    isDeploying
                  }
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

                    if (
                      !isDeploying
                    ) {
                      setError("");
                    }
                  }}
                  placeholder="TST"
                  disabled={
                    isDeploying
                  }
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

                    if (
                      !isDeploying
                    ) {
                      setError("");
                    }
                  }}
                  placeholder="1000000"
                  disabled={
                    isDeploying
                  }
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

                    if (
                      !isDeploying
                    ) {
                      setError("");
                    }
                  }}
                  disabled={
                    isDeploying
                  }
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

              {/* ARTIFACT */}

              {artifactLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/50">
                  <Loader2
                    size={18}
                    className="animate-spin text-cyan-400"
                  />

                  Loading token contract...
                </div>
              )}

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
                        artifacts/IOPnToken.json
                      </code>

                      <code className="mt-1 block text-[11px] text-red-300/70">
                        artifacts/IOPnToken-standard-input.json
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

              {/* =================================================
                  SUCCESS
              ================================================= */}

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
                            Your ERC-20 token has been deployed
                            successfully on IOPn Testnet.
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

                      {/* LINKS */}

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

                    {/* =================================================
                        VERIFICATION
                    ================================================= */}

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
                            IOPn DEX submits the exact Standard
                            JSON source and constructor arguments,
                            then checks the explorer for confirmed
                            source-code verification.
                          </p>
                        </div>
                      </div>

                      {/* COMPILER */}

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
                            {artifact?.optimization?.enabled !==
                            false
                              ? "Enabled"
                              : "Disabled"}{" "}
                            ·{" "}
                            {artifact?.optimization?.runs ||
                              200}{" "}
                            runs
                          </p>
                        </div>
                      </div>

                      {renderVerificationStatus()}

                      {/* CHECK AGAIN */}

                      {verificationStatus !==
                        "verified" && (
                        <button
                          type="button"
                          onClick={
                            handleCheckAgain
                          }
                          disabled={
                            checkingAgain ||
                            verificationStatus ===
                              "checking"
                          }
                          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-black text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {checkingAgain ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <RefreshCw
                              size={17}
                            />
                          )}

                          Check Verification Again
                        </button>
                      )}

                      {/* MANUAL */}

                      {verificationStatus !==
                        "verified" && (
                        <a
                          href={
                            manualVerificationUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-white/65 transition hover:border-cyan-400/30 hover:text-cyan-400"
                        >
                          <FileCheck2
                            size={17}
                          />

                          Verify Manually on Explorer

                          <ExternalLink
                            size={14}
                          />
                        </a>
                      )}

                      {/* VERIFIED CONFIRMATION */}

                      {verificationStatus ===
                        "verified" && (
                        <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2
                              size={16}
                              className="text-emerald-400"
                            />

                            <p className="text-xs font-black text-emerald-300">
                              Contract verified
                            </p>
                          </div>

                          <p className="mt-1 text-[10px] leading-4 text-white/30">
                            The IOPn Explorer has confirmed the
                            verified source code.
                          </p>
                        </div>
                      )}

                      {/* INFO */}

                      <p className="mt-3 text-center text-[10px] leading-4 text-white/25">
                        If you verify the contract manually,
                        return here and tap{" "}
                        <span className="font-bold text-white/40">
                          Check Verification Again
                        </span>
                        . The app will only display
                        <span className="font-bold text-emerald-400/70">
                          {" "}
                          Contract verified
                        </span>{" "}
                        after the explorer confirms it.
                      </p>
                    </div>
                  </div>
                )}

              {/* =================================================
                  DEPLOY BUTTON
              ================================================= */}

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
                and network gas. Verification does not require
                another wallet transaction.
              </p>

              {/* RESET */}

              {status ===
                "success" && (
                <button
                  type="button"
                  onClick={
                    resetStatus
                  }
                  className="w-full text-center text-xs font-bold text-white/30 transition hover:text-white/60"
                >
                  Deploy another token
                </button>
              )}
            </div>
          </div>
        </form>

        {/* =================================================
            FOOTER
        ================================================= */}

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