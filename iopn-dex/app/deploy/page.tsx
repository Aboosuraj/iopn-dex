"use client";

import { useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { parseUnits } from "viem";
import Link from "next/link";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const EXPLORER_URL =
  "https://testnet.iopn.tech";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

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
  submitted?: boolean;
  waitingForIndexing?: boolean;
  verificationId?: string | null;
  explorerConfirmed?: boolean;
  message?: string;
  error?: string;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function DeployPage() {
  const { address, isConnected } =
    useAccount();

  const publicClient =
    usePublicClient();

  const { data: walletClient } =
    useWalletClient();

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const [name, setName] =
    useState("IOPn Token");

  const [symbol, setSymbol] =
    useState("IOPN");

  const [supply, setSupply] =
    useState("1000000");

  const [decimals, setDecimals] =
    useState("18");

  /*
  |--------------------------------------------------------------------------
  | DEPLOYMENT
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | LOAD ARTIFACT
  |--------------------------------------------------------------------------
  */

  async function loadArtifact() {
    const response =
      await fetch(
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

  /*
  |--------------------------------------------------------------------------
  | LOAD STANDARD JSON
  |--------------------------------------------------------------------------
  */

  async function loadStandardInput() {
    const response =
      await fetch(
        "/api/verify?standardInput=true",
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        "Unable to load Solidity Standard JSON compiler input."
      );
    }

    const data =
      await response.json();

    if (
      !data?.success ||
      !data?.standardInput
    ) {
      throw new Error(
        "Solidity Standard JSON compiler input is unavailable."
      );
    }

    return data.standardInput;
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK EXPLORER
  |--------------------------------------------------------------------------
  |
  | THIS IS THE ONLY FUNCTION THAT CAN MAKE THE UI VERIFIED.
  |
  */

  async function checkExplorer(
    addressToCheck: string
  ) {
    const response =
      await fetch(
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
      await response.json();

    return {
      verified:
        data?.verified === true,

      indexed:
        data?.indexed === true,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | WAIT FOR EXPLORER INDEXING
  |--------------------------------------------------------------------------
  */

  async function waitForIndexing(
    addressToCheck: string
  ) {
    setState("indexing");

    setMessage(
      "Waiting for IOPn Explorer to index the contract..."
    );

    /*
     * 20 attempts × 3 seconds
     */
    for (
      let attempt = 1;
      attempt <= 20;
      attempt++
    ) {
      const result =
        await checkExplorer(
          addressToCheck
        );

      /*
       * NEVER mark verified from deployment.
       *
       * Only the explorer can do this.
       */
      if (
        result.verified
      ) {
        return {
          verified: true,
          indexed: true,
        };
      }

      if (
        result.indexed
      ) {
        return {
          verified: false,
          indexed: true,
        };
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            3000
          )
      );
    }

    return {
      verified: false,
      indexed: false,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT VERIFICATION
  |--------------------------------------------------------------------------
  */

  async function verifyContract(
    addressToVerify: string
  ) {
    setState("verifying");

    setMessage(
      "Submitting the exact compiled contract to the IOPn Explorer..."
    );

    /*
     * Load the EXACT Standard JSON used for verification.
     */
    const standardInput =
      await loadStandardInput();

    /*
     * Use the existing server-side verification
     * endpoint instead of exposing explorer API
     * details in the browser.
     */
    const response =
      await fetch(
        "/api/verify-token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            contractAddress:
              addressToVerify,

            contractName:
              "IOPnToken",

            compilerVersion:
              "v0.8.36+commit.8a079791",

            standardInput,

            licenseType:
              "mit",
          }),
        }
      );

    const data =
      (await response.json()) as VerificationResponse;

    /*
     * HTTP success does NOT mean verified.
     */
    if (
      data.verificationId
    ) {
      setVerificationId(
        data.verificationId
      );
    }

    /*
     * If server already confirms explorer verification,
     * we can show verified.
     */
    if (
      data.verified === true
    ) {
      const finalCheck =
        await checkExplorer(
          addressToVerify
        );

      /*
       * DOUBLE CHECK.
       *
       * Never trust the verification endpoint alone.
       */
      if (
        finalCheck.verified
      ) {
        setState("verified");

        setMessage(
          "✓ Contract source code is verified on the IOPn Explorer."
        );

        return true;
      }
    }

    /*
     * Verification was submitted but explorer
     * has not confirmed it yet.
     */
    setMessage(
      data.message ||
        "Verification submitted. Waiting for explorer confirmation..."
    );

    return await pollExplorerUntilVerified(
      addressToVerify
    );
  }

  /*
  |--------------------------------------------------------------------------
  | POLL EXPLORER
  |--------------------------------------------------------------------------
  */

  async function pollExplorerUntilVerified(
    addressToCheck: string
  ) {
    setState("verifying");

    /*
     * 30 attempts × 5 seconds
     *
     * Maximum ≈ 150 seconds.
     */
    for (
      let attempt = 1;
      attempt <= 30;
      attempt++
    ) {
      setMessage(
        `Waiting for explorer verification... (${attempt}/30)`
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
          "✓ Verified on IOPn Explorer."
        );

        return true;
      }

      /*
       * Never set verified here.
       */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            5000
          )
      );
    }

    /*
     * Explorer still hasn't confirmed it.
     *
     * IMPORTANT:
     *
     * This is NOT a verification success.
     */
    setState("deployed");

    setMessage(
      "Verification was submitted, but the IOPn Explorer has not confirmed the source code yet."
    );

    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | DEPLOY
  |--------------------------------------------------------------------------
  */

  async function deploy() {
    setError("");
    setMessage("");
    setContractAddress("");
    setTransactionHash("");
    setVerificationId(null);

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
     * Validate form.
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

    /*
     * Parse supply.
     */
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
      /*
       * -------------------------------------------------------
       * STEP 1
       * DEPLOY
       * -------------------------------------------------------
       */

      setState("deploying");

      setMessage(
        "Deploying IOPnToken..."
      );

      const artifact =
        await loadArtifact();

      if (
        !artifact?.bytecode
      ) {
        throw new Error(
          "IOPnToken bytecode is missing from the artifact."
        );
      }

      /*
       * Constructor used by the current IOPnToken:
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
        "Transaction submitted. Waiting for deployment confirmation..."
      );

      /*
       * -------------------------------------------------------
       * STEP 2
       * WAIT FOR RECEIPT
       * -------------------------------------------------------
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
       * -------------------------------------------------------
       * STEP 3
       * GET ACTUAL CONTRACT ADDRESS
       * -------------------------------------------------------
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
        "Contract deployed successfully. Waiting for explorer indexing..."
      );

      /*
       * -------------------------------------------------------
       * STEP 4
       * WAIT FOR EXPLORER
       * -------------------------------------------------------
       */

      const indexed =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * Explorer may have verified it already.
       */
      if (
        indexed.verified
      ) {
        setState("verified");

        setMessage(
          "✓ Explorer confirms that this contract is verified."
        );

        return;
      }

      /*
       * Explorer did not index it yet.
       */
      if (
        !indexed.indexed
      ) {
        setState("deployed");

        setMessage(
          "Contract deployed, but the explorer has not indexed it yet. The app will NOT show it as verified."
        );

        return;
      }

      /*
       * -------------------------------------------------------
       * STEP 5
       * VERIFY
       * -------------------------------------------------------
       */

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

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  const isBusy =
    state === "deploying" ||
    state === "indexing" ||
    state === "verifying";

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-xl">

        {/* ---------------------------------------------------
            HEADER
        --------------------------------------------------- */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            IOPn Testnet
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Deploy Token
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Deploy an IOPnToken and verify its exact
            compiled source on the IOPn Explorer.
          </p>
        </div>

        {/* ---------------------------------------------------
            FORM
        --------------------------------------------------- */}

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

          {/* -------------------------------------------------
              DEPLOY BUTTON
          ------------------------------------------------- */}

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
              ? "Waiting for Explorer..."
              : state ===
                "verifying"
              ? "Verifying..."
              : "Deploy Token"}
          </button>

          {/* -------------------------------------------------
              WALLET
          ------------------------------------------------- */}

          {!isConnected && (
            <p className="mt-3 text-center text-sm text-yellow-400">
              Connect your wallet to deploy.
            </p>
          )}

          {/* -------------------------------------------------
              MESSAGE
          ------------------------------------------------- */}

          {message && (
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
              {message}
            </div>
          )}

          {/* -------------------------------------------------
              ERROR
          ------------------------------------------------- */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* -------------------------------------------------
              CONTRACT ADDRESS
          ------------------------------------------------- */}

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

          {/* -------------------------------------------------
              TRANSACTION
          ------------------------------------------------- */}

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

          {/* -------------------------------------------------
              VERIFICATION ID
          ------------------------------------------------- */}

          {verificationId && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">

              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Verification Request
              </p>

              <p className="break-all font-mono text-xs text-zinc-500">
                {verificationId}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                A verification request ID is NOT treated
                as proof of verification.
              </p>
            </div>
          )}

          {/* -------------------------------------------------
              VERIFIED
          ------------------------------------------------- */}

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
                    Explorer-confirmed source code verification.
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

          {/* -------------------------------------------------
              NOT VERIFIED
          ------------------------------------------------- */}

          {contractAddress &&
            state === "deployed" && (
              <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/20 p-5">

                <p className="font-semibold text-yellow-300">
                  Not yet verified
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-400/70">
                  The contract is deployed, but the
                  explorer has not confirmed source-code
                  verification. The application intentionally
                  does not display this contract as verified.
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

        {/* ---------------------------------------------------
            BACK
        --------------------------------------------------- */}

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