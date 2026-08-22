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

type ExplorerStatus = {
  verified: boolean;
  indexed: boolean;
};

type VerificationResponse = {
  success?: boolean;
  submitted?: boolean;
  verified?: boolean;
  explorerConfirmed?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
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
     DEPLOYMENT
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
     * Make sure it is valid JSON.
     */

    JSON.parse(
      data.standardInput
    );

    return data.standardInput;
  }

  /* =======================================================
     CHECK EXPLORER
     
     IMPORTANT:
     Explorer is the ONLY source of truth.
  ======================================================= */

  async function checkExplorer(
    contract: string
  ): Promise<ExplorerStatus> {
    try {
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
    } catch {
      return {
        verified: false,
        indexed: false,
      };
    }
  }

  /* =======================================================
     WAIT FOR EXPLORER INDEXING
  ======================================================= */

  async function waitForIndexing(
    contract: string
  ) {
    setState("indexing");

    for (
      let attempt = 1;
      attempt <= 20;
      attempt++
    ) {
      setMessage(
        `Waiting for Explorer indexing... (${attempt}/20)`
      );

      const result =
        await checkExplorer(
          contract
        );

      /*
       * If already verified, stop.
       */

      if (result.verified) {
        return result;
      }

      /*
       * Explorer knows the contract.
       */

      if (result.indexed) {
        return result;
      }

      if (attempt < 20) {
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
     ENCODE CONSTRUCTOR ARGUMENTS
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
      "Submitting the exact Standard JSON to the IOPn Explorer..."
    );

    /*
     * Load the exact Standard JSON.
     */

    const standardInput =
      await loadStandardInput();

    /*
     * Encode the exact constructor arguments
     * used during deployment.
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
     * -------------------------------------------------------
     * IMPORTANT
     *
     * The actual verification endpoint is:
     *
     * /api/market/verify-token
     *
     * It expects FormData.
     * -------------------------------------------------------
     */

    const form =
      new FormData();

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

    const response =
      await fetch(
        "/api/market/verify-token",
        {
          method: "POST",
          body: form,
          cache: "no-store",
        }
      );

    const data =
      (await response.json()) as VerificationResponse;

    /*
     * Submission failure.
     */

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Explorer verification submission failed."
      );
    }

    setMessage(
      "Verification submitted. Waiting for the IOPn Explorer to confirm the source code..."
    );

    /*
     * -------------------------------------------------------
     * NEVER TRUST THE SUBMISSION RESPONSE.
     *
     * Check Explorer itself.
     * -------------------------------------------------------
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

      /*
       * Check immediately before waiting.
       */

      const result =
        await checkExplorer(
          contract
        );

      /*
       * ONLY THIS CONDITION CAN PRODUCE
       * THE VERIFIED UI.
       */

      if (
        result.verified === true
      ) {
        setState("verified");

        setMessage(
          "✓ Verified on IOPn Explorer."
        );

        return true;
      }

      /*
       * Wait 3 seconds.
       */

      if (attempt < 30) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              3000
            )
        );
      }
    }

    /*
     * Explorer did not confirm it.
     *
     * This is NOT verification success.
     */

    setState("deployed");

    setMessage(
      "Verification was submitted, but the IOPn Explorer has not confirmed the source code yet."
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

    /*
     * Wallet checks.
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
      /*
       * -----------------------------------------------------
       * STEP 1 — DEPLOY
       * -----------------------------------------------------
       */

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

      setTransactionHash(
        hash
      );

      setMessage(
        "Deployment transaction submitted. Waiting for confirmation..."
      );

      /*
       * -----------------------------------------------------
       * STEP 2 — RECEIPT
       * -----------------------------------------------------
       */

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

      /*
       * -----------------------------------------------------
       * STEP 3 — ACTUAL CONTRACT ADDRESS
       * -----------------------------------------------------
       */

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
        "Contract deployed successfully. Checking the IOPn Explorer..."
      );

      /*
       * -----------------------------------------------------
       * STEP 4 — CHECK EXPLORER
       * -----------------------------------------------------
       */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * If Explorer already says verified,
       * show verified.
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
       * -----------------------------------------------------
       * STEP 5 — AUTOMATIC VERIFICATION
       * -----------------------------------------------------
       */

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
            Create Token
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Create your token with fun on the
            OPN chain. Deploy your own
            IOPnToken directly from your
            connected wallet.
          </p>
        </div>

        {/* FORM */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">

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

          <button
            type="button"
            onClick={deploy}
            disabled={
              isBusy ||
              !isConnected
            }
            className="w-full rounded-xl bg-white px-5 py-3.5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === "deploying"
              ? "Deploying..."
              : state === "indexing"
              ? "Checking Explorer..."
              : state === "verifying"
              ? "Verifying..."
              : state === "verified"
              ? "Verified"
              : "Create Token"}
          </button>

          {!isConnected && (
            <p className="mt-3 text-center text-sm text-yellow-400">
              Connect your wallet to create a token.
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
                View contract on Explorer →
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
                      Confirmed directly by the Explorer.
                    </p>
                  </div>

                </div>

                <a
                  href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Confirm on Explorer →
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
                  The contract is deployed, but
                  the IOPn Explorer has not
                  confirmed source-code
                  verification yet.
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