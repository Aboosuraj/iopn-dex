"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { encodeAbiParameters, parseUnits } from "viem";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

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
  const { address, isConnected } =
    useAccount();

  const publicClient =
    usePublicClient();

  const { data: walletClient } =
    useWalletClient();

  /* =======================================================
     FORM
  ======================================================= */

  const [name, setName] =
    useState("IOPn Token");

  const [symbol, setSymbol] =
    useState("IOPN");

  const [supply, setSupply] =
    useState("1000000");

  const [decimals, setDecimals] =
    useState("18");

  /* =======================================================
     DEPLOYMENT STATE
  ======================================================= */

  const [contractAddress, setContractAddress] =
    useState("");

  const [transactionHash, setTransactionHash] =
    useState("");

  const [state, setState] =
    useState<DeploymentState>("idle");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [verificationId, setVerificationId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD ARTIFACT
  ======================================================= */

  async function loadArtifact() {
    const response = await fetch(
      "/api/verify?artifact=true",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load IOPnToken artifact."
      );
    }

    const data =
      await response.json();

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
      "/api/verify?standardInput=true",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load IOPnToken-standard-input.json."
      );
    }

    const data =
      await response.json();

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

    /*
     * Validate that the response really is JSON.
     */
    JSON.parse(
      data.standardInput
    );

    return data.standardInput;
  }

  /* =======================================================
     EXPLORER CHECK
     
     IMPORTANT:
     
     This is the ONLY source of truth for UI verification.
  ======================================================= */

  async function checkExplorer(
    contract: string
  ) {
    const response =
      await fetch(
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

    const data =
      await response.json();

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
        await checkExplorer(
          contract
        );

      /*
       * Explorer may already have verification.
       */
      if (
        result.verified
      ) {
        return {
          verified: true,
          indexed: true,
        };
      }

      /*
       * Explorer knows the contract.
       */
      if (
        result.indexed
      ) {
        return {
          verified: false,
          indexed: true,
        };
      }

      setMessage(
        `Waiting for Explorer indexing... (${attempt}/20)`
      );

      if (
        attempt < 20
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1500
            )
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
     
     Constructor:
     
     string name
     string symbol
     uint256 totalSupply
     uint8 decimals
     address owner
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

    /*
     * Load EXACT Standard JSON used by manual verification.
     */
    const standardInput =
      await loadStandardInput();

    /*
     * Encode the EXACT constructor arguments used
     * during this deployment.
     */
    const constructorArgs =
      encodeConstructorArguments(
        name.trim(),
        symbol.trim(),
        totalSupply,
        tokenDecimals,
        address!
      );

    /*
     * Submit ONLY to /api/verify.
     */
    const response =
      await fetch(
        "/api/verify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          cache: "no-store",

          body: JSON.stringify({
            address: contract,

            contractName:
              "IOPnToken",

            compilerVersion:
              "v0.8.36+commit.8a079791",

            licenseType:
              "mit",

            standardInput,

            constructorArgs,

            optimizationEnabled:
              true,

            optimizationRuns:
              200,
          }),
        }
      );

    const data =
      (await response.json()) as VerificationResponse;

    if (
      data.verificationId
    ) {
      setVerificationId(
        data.verificationId
      );
    }

    /*
     * NEVER trust the POST response alone.
     *
     * Immediately ask Explorer again.
     */
    const immediate =
      await checkExplorer(
        contract
      );

    if (
      immediate.verified
    ) {
      setState("verified");

      setMessage(
        "✓ Explorer confirms that the contract source code is verified."
      );

      return true;
    }

    /*
     * Poll the actual Explorer.
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
          setTimeout(
            resolve,
            2500
          )
      );

      const result =
        await checkExplorer(
          contract
        );

      /*
       * ONLY Explorer confirmation can produce
       * verified=true.
       */
      if (
        result.verified
      ) {
        setState("verified");

        setMessage(
          "✓ Verified on IOPn Explorer."
        );

        return true;
      }
    }

    /*
     * Explorer did not confirm verification.
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

    /*
     * Wallet validation.
     */
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

    /*
     * Form validation.
     */
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
      totalSupply =
        parseUnits(
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
      /* ===================================================
         STEP 1 — DEPLOY
      =================================================== */

      setState("deploying");

      setMessage(
        "Deploying IOPnToken..."
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
            abi:
              artifact.abi,

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

      setTransactionHash(
        hash
      );

      setMessage(
        "Deployment transaction submitted. Waiting for confirmation..."
      );

      /* ===================================================
         STEP 2 — RECEIPT
      =================================================== */

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

      /* ===================================================
         STEP 3 — ACTUAL CONTRACT ADDRESS
      =================================================== */

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
        "Contract deployed successfully."
      );

      /* ===================================================
         STEP 4 — EXPLORER INDEXING
      =================================================== */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * If Explorer already confirms verification,
       * stop here.
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
       * If Explorer has not indexed the contract,
       * do NOT falsely call it verified.
       *
       * However, we continue to verification because
       * the Explorer's Standard JSON endpoint can accept
       * the verification request.
       */

      if (
        !explorerState.indexed
      ) {
        setMessage(
          "Explorer has not indexed the contract yet. Preparing Standard JSON verification..."
        );
      }

      /* ===================================================
         STEP 5 — AUTOMATIC STANDARD JSON VERIFICATION
      =================================================== */

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
     UI STATE
  ======================================================= */

  const isBusy =
    state === "deploying" ||
    state === "indexing" ||
    state === "verifying";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            IOPn Testnet
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Deploy Token
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Deploy an IOPnToken and automatically
            verify its exact compiled Standard JSON
            on the IOPn Explorer.
          </p>
        </div>

        {/* FORM */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">

          {/* NAME */}

          <label className="mb-2 block text-sm text-zinc-400">
            Token Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            disabled={isBusy}
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            placeholder="IOPn Token"
          />

          {/* SYMBOL */}

          <label className="mb-2 block text-sm text-zinc-400">
            Token Symbol
          </label>

          <input
            value={symbol}
            onChange={(event) =>
              setSymbol(
                event.target.value
              )
            }
            disabled={isBusy}
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            placeholder="IOPN"
          />

          {/* SUPPLY */}

          <label className="mb-2 block text-sm text-zinc-400">
            Total Supply
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
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            placeholder="1000000"
          />

          {/* DECIMALS */}

          <label className="mb-2 block text-sm text-zinc-400">
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
            className="mb-6 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
            placeholder="18"
          />

          {/* DEPLOY */}

          <button
            type="button"
            onClick={deploy}
            disabled={
              isBusy ||
              !isConnected
            }
            className="w-full rounded-xl bg-white px-5 py-3.5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state ===
            "deploying"
              ? "Deploying..."
              : state ===
                "indexing"
              ? "Indexing..."
              : state ===
                "verifying"
              ? "Verifying..."
              : state ===
                "verified"
              ? "Verified"
              : "Deploy Token"}
          </button>

          {!isConnected && (
            <p className="mt-3 text-center text-sm text-yellow-400">
              Connect your wallet to deploy.
            </p>
          )}

          {/* MESSAGE */}

          {message && (
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* CONTRACT */}

          {contractAddress && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">

              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Contract Address
              </p>

              <p className="break-all font-mono text-sm text-white">
                {contractAddress}
              </p>

              <a
                href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                View contract on IOPn Explorer →
              </a>
            </div>
          )}

          {/* TRANSACTION */}

          {transactionHash && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">

              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Deployment Transaction
              </p>

              <p className="break-all font-mono text-xs text-zinc-400">
                {transactionHash}
              </p>

              <a
                href={`${EXPLORER_URL}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm text-cyan-400 hover:text-cyan-300"
              >
                View transaction →
              </a>
            </div>
          )}

          {/* VERIFICATION REQUEST */}

          {verificationId && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">

              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Verification Request
              </p>

              <p className="break-all font-mono text-xs text-zinc-500">
                {verificationId}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                This ID is not proof of verification.
                The Explorer must confirm the source code.
              </p>
            </div>
          )}

          {/* VERIFIED */}

          {state === "verified" &&
            contractAddress && (
              <div className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950/30 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-black">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-emerald-300">
                      Verified on IOPn Explorer
                    </p>

                    <p className="mt-1 text-xs text-emerald-400/70">
                      Explorer-confirmed source code verification.
                    </p>
                  </div>

                </div>

                <a
                  href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Confirm verification on Explorer →
                </a>
              </div>
            )}

          {/* NOT VERIFIED */}

          {contractAddress &&
            state === "deployed" && (
              <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/20 p-5">

                <p className="font-semibold text-yellow-300">
                  Contract deployed — not verified
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-400/70">
                  The contract is deployed, but the
                  IOPn Explorer has not confirmed its
                  source code as verified. The application
                  will not display it as verified.
                </p>

                <a
                  href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-yellow-300 hover:text-yellow-200"
                >
                  Open Explorer →
                </a>
              </div>
            )}

          {/* FAILED */}

          {state === "failed" && (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950/20 p-5">
              <p className="font-semibold text-red-300">
                Deployment failed
              </p>
            </div>
          )}
        </div>

        {/* BACK */}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}