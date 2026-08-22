"use client";

import { useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { parseUnits } from "viem";
import Link from "next/link";

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
  | "indexing"
  | "verifying"
  | "verified"
  | "deployed"
  | "failed";

type VerifyResponse = {
  success?: boolean;
  verified?: boolean;
  indexed?: boolean;
  submitted?: boolean;
  alreadyVerified?: boolean;
  waitingForIndexing?: boolean;
  explorerConfirmed?: boolean;
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

    const data = await response.json();

    if (
      !response.ok ||
      !data?.success ||
      !data?.artifact
    ) {
      throw new Error(
        data?.error ||
          "Unable to load IOPnToken artifact."
      );
    }

    return data.artifact;
  }

  /* =======================================================
     LOAD STANDARD JSON
  ======================================================= */

  async function loadStandardInput() {
    const response = await fetch(
      "/api/verify?standardInput=true",
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (
      !response.ok ||
      !data?.success ||
      !data?.standardInput
    ) {
      throw new Error(
        data?.error ||
          "Unable to load Solidity Standard JSON compiler input."
      );
    }

    return data.standardInput;
  }

  /* =======================================================
     CHECK EXPLORER
     ======================================================= */

  async function checkExplorer(
    addressToCheck: string
  ) {
    try {
      const response = await fetch(
        `/api/verify?address=${encodeURIComponent(
          addressToCheck
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
        (await response.json()) as VerifyResponse;

      /*
       * IMPORTANT:
       *
       * The frontend trusts ONLY:
       *
       * verified === true
       *
       * It does NOT trust:
       *
       * success
       * submitted
       * verificationId
       * HTTP 200
       */

      return {
        verified:
          data.verified === true,

        indexed:
          data.indexed === true,
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
    addressToCheck: string
  ) {
    setState("indexing");

    setMessage(
      "Waiting for IOPn Explorer to index the new contract..."
    );

    const attempts = 20;

    for (
      let attempt = 1;
      attempt <= attempts;
      attempt++
    ) {
      setMessage(
        `Waiting for IOPn Explorer indexing... (${attempt}/${attempts})`
      );

      const result =
        await checkExplorer(
          addressToCheck
        );

      /*
       * If explorer already confirms verification,
       * stop immediately.
       */

      if (
        result.verified === true
      ) {
        return {
          verified: true,
          indexed: true,
        };
      }

      /*
       * Once explorer knows the contract,
       * return indexed.
       */

      if (
        result.indexed === true
      ) {
        return {
          verified: false,
          indexed: true,
        };
      }

      if (
        attempt < attempts
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              3000
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
     VERIFY CONTRACT
  ======================================================= */

  async function verifyContract(
    addressToVerify: string
  ) {
    setState("verifying");

    setMessage(
      "Preparing the exact Solidity Standard JSON compiler input..."
    );

    /*
     * Load the exact Standard JSON generated
     * during compilation.
     */

    const standardInput =
      await loadStandardInput();

    setMessage(
      "Submitting contract verification to the IOPn Explorer..."
    );

    /*
     * IMPORTANT:
     *
     * There is ONLY ONE verification endpoint now.
     *
     * We do NOT use:
     *
     * /api/verify-token
     *
     * anymore.
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
            address:
              addressToVerify,

            contractName:
              "IOPnToken",

            compilerVersion:
              "v0.8.36+commit.8a079791",

            licenseType:
              "mit",

            standardInput,

            /*
             * The deploy page does not invent
             * constructor arguments.
             *
             * The verification API is responsible
             * for obtaining/handling the correct
             * constructor arguments.
             */
          }),
        }
      );

    const data =
      (await response.json()) as VerifyResponse;

    if (
      data.verificationId
    ) {
      setVerificationId(
        data.verificationId
      );
    }

    /*
     * HTTP failure.
     */

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.message ||
          "Explorer verification request failed."
      );
    }

    /*
     * If the API says verified,
     * DOUBLE CHECK the explorer.
     */

    if (
      data.verified === true
    ) {
      setMessage(
        "Explorer reported verification. Performing final confirmation..."
      );

      const finalCheck =
        await checkExplorer(
          addressToVerify
        );

      /*
       * ONLY the explorer check can
       * transition the UI to verified.
       */

      if (
        finalCheck.verified === true
      ) {
        setState("verified");

        setMessage(
          "✓ Contract source code is verified on the IOPn Explorer."
        );

        return true;
      }

      /*
       * The API claimed success but Explorer
       * does not confirm it.
       */

      setState("deployed");

      setMessage(
        "Verification was submitted, but the Explorer does not confirm the contract as verified."
      );

      return false;
    }

    /*
     * Explorer has not confirmed verification yet.
     */

    setMessage(
      data.message ||
        "Verification submitted. Waiting for Explorer confirmation..."
    );

    return await pollExplorerUntilVerified(
      addressToVerify
    );
  }

  /* =======================================================
     POLL EXPLORER
  ======================================================= */

  async function pollExplorerUntilVerified(
    addressToCheck: string
  ) {
    setState("verifying");

    const attempts = 30;

    for (
      let attempt = 1;
      attempt <= attempts;
      attempt++
    ) {
      setMessage(
        `Waiting for IOPn Explorer verification... (${attempt}/${attempts})`
      );

      const result =
        await checkExplorer(
          addressToCheck
        );

      /*
       * THIS IS THE ONLY SUCCESS CONDITION.
       */

      if (
        result.verified === true
      ) {
        setState("verified");

        setMessage(
          "✓ Explorer confirms that the contract source code is verified."
        );

        return true;
      }

      /*
       * Never mark verified from:
       *
       * submitted
       * success
       * GUID
       * transaction success
       */

      if (
        attempt < attempts
      ) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              5000
            )
        );
      }
    }

    setState("deployed");

    setMessage(
      "The verification request was submitted, but the IOPn Explorer has not confirmed the source code as verified."
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
    setState("idle");

    /* -------------------------------------------------------
       WALLET
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       FORM VALIDATION
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       SUPPLY
    ------------------------------------------------------- */

    let totalSupply;

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
      /* =====================================================
         STEP 1 — LOAD ARTIFACT
      ===================================================== */

      setState("deploying");

      setMessage(
        "Loading the compiled IOPnToken artifact..."
      );

      const artifact =
        await loadArtifact();

      if (
        !artifact?.abi ||
        !artifact?.bytecode
      ) {
        throw new Error(
          "IOPnToken ABI or bytecode is missing from the artifact."
        );
      }

      /* =====================================================
         STEP 2 — DEPLOY
      ===================================================== */

      setMessage(
        "Deploying IOPnToken..."
      );

      /*
       * IMPORTANT:
       *
       * These constructor arguments must remain
       * identical to the contract compilation:
       *
       * name
       * symbol
       * totalSupply
       * decimals
       * owner
       */

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

      /* =====================================================
         STEP 3 — WAIT FOR RECEIPT
      ===================================================== */

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

      /* =====================================================
         STEP 4 — ACTUAL CONTRACT ADDRESS
      ===================================================== */

      const deployedAddress =
        receipt.contractAddress;

      if (!deployedAddress) {
        throw new Error(
          "Deployment succeeded, but no contract address was returned."
        );
      }

      /*
       * IMPORTANT:
       *
       * Always use the address returned by the
       * blockchain receipt.
       *
       * Never use a manually stored address.
       */

      setContractAddress(
        deployedAddress
      );

      setState("deployed");

      setMessage(
        `Contract deployed at ${deployedAddress}.`
      );

      /* =====================================================
         STEP 5 — WAIT FOR EXPLORER
      ===================================================== */

      const indexed =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * Explorer already verified.
       */

      if (
        indexed.verified === true
      ) {
        setState("verified");

        setMessage(
          "✓ Explorer confirms that this contract is already verified."
        );

        return;
      }

      /*
       * Explorer doesn't know contract.
       */

      if (
        indexed.indexed !== true
      ) {
        setState("deployed");

        setMessage(
          "Contract deployed successfully, but the IOPn Explorer has not indexed the contract yet. Verification was not falsely marked as successful."
        );

        return;
      }

      /* =====================================================
         STEP 6 — VERIFY
      ===================================================== */

      await verifyContract(
        deployedAddress
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
            Deploy an IOPnToken and verify its
            exact compiled source on the IOPn
            Explorer.
          </p>
        </div>

        {/* CARD */}

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

          {/* DEPLOY BUTTON */}

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
              ? "Waiting for Explorer..."
              : state === "verifying"
              ? "Verifying..."
              : state === "verified"
              ? "Verified"
              : "Deploy Token"}
          </button>

          {/* WALLET */}

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
                A verification request ID is
                never treated as proof of
                verification.
              </p>
            </div>
          )}

          {/* VERIFIED */}

          {state === "verified" && (
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
                    The Explorer itself confirmed
                    the published source code.
                  </p>
                </div>

              </div>

              {contractAddress && (
                <a
                  href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Confirm verification on Explorer →
                </a>
              )}
            </div>
          )}

          {/* NOT VERIFIED */}

          {contractAddress &&
            state === "deployed" && (
              <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/20 p-5">

                <p className="font-semibold text-yellow-300">
                  Not yet verified
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-400/70">
                  The contract is deployed,
                  but the IOPn Explorer has
                  not confirmed source-code
                  verification.
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