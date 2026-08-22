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

const EXPLORER_URL =
  "https://testnet.iopn.tech";

type DeploymentState =
  | "idle"
  | "deploying"
  | "deployed"
  | "indexing"
  | "verifying"
  | "verified"
  | "failed";

type ArtifactResponse = {
  success?: boolean;
  artifact?: {
    abi: any[];
    bytecode: string;
  };
  standardInput?: string;
  verification?: {
    compilerVersion?: string;
    optimizationEnabled?: boolean;
    optimizationRuns?: number;
    license?: string;
  };
  error?: string;
};

type VerificationResponse = {
  success?: boolean;
  submitted?: boolean;
  verified?: boolean;
  verificationId?: string;
  message?: string;
  data?: any;
};

export default function DeployPage() {
  const {
    address,
    isConnected,
  } = useAccount();

  const publicClient =
    usePublicClient();

  const {
    data: walletClient,
  } =
    useWalletClient();

  const [name, setName] =
    useState("IOPn Token");

  const [symbol, setSymbol] =
    useState("IOPN");

  const [supply, setSupply] =
    useState("1000000");

  const [decimals, setDecimals] =
    useState("18");

  const [
    contractAddress,
    setContractAddress,
  ] = useState("");

  const [
    transactionHash,
    setTransactionHash,
  ] = useState("");

  const [state, setState] =
    useState<DeploymentState>(
      "idle"
    );

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    verificationId,
    setVerificationId,
  ] = useState<string | null>(
    null
  );

  /*
   * -------------------------------------------------------
   * LOAD DEPLOYMENT ARTIFACT
   * -------------------------------------------------------
   */

  async function loadArtifact() {
    const response =
      await fetch(
        "/api/deploy/artifact",
        {
          cache: "no-store",
        }
      );

    const data =
      (await response.json()) as ArtifactResponse;

    if (
      !response.ok ||
      !data.success ||
      !data.artifact ||
      !data.standardInput
    ) {
      throw new Error(
        data.error ||
          "Unable to load IOPnToken deployment artifact."
      );
    }

    return data;
  }

  /*
   * -------------------------------------------------------
   * CHECK REAL EXPLORER STATE
   * -------------------------------------------------------
   */

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
        data.verified === true &&
        data.explorerConfirmed ===
          true,

      indexed:
        data.indexed === true,
    };
  }

  /*
   * -------------------------------------------------------
   * WAIT FOR EXPLORER INDEXING
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * ENCODE CONSTRUCTOR ARGUMENTS
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * SUBMIT AUTOMATIC VERIFICATION
   *
   * IMPORTANT:
   *
   * This submits to:
   *
   * /api/markets/verify-token
   *
   * NOT /api/verify
   * -------------------------------------------------------
   */

  async function verifyContract(
    contract: string,
    totalSupply: bigint,
    tokenDecimals: number
  ) {
    setState("verifying");

    setMessage(
      "Submitting Standard JSON verification to the IOPn Explorer..."
    );

    const artifact =
      await loadArtifact();

    const constructorArgs =
      encodeConstructorArguments(
        name.trim(),
        symbol.trim(),
        totalSupply,
        tokenDecimals,
        address!
      );

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
      "standard_input",
      artifact.standardInput!
    );

    form.append(
      "constructor_args",
      constructorArgs
    );

    const response =
      await fetch(
        "/api/markets/verify-token",
        {
          method: "POST",
          body: form,
          cache: "no-store",
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

    if (
      !response.ok ||
      data.success !== true
    ) {
      throw new Error(
        data.message ||
          "Explorer verification submission failed."
      );
    }

    /*
     * IMPORTANT:
     *
     * Submission success is NOT
     * verification success.
     */

    setMessage(
      "Verification submitted. Waiting for the IOPn Explorer to confirm the source code..."
    );

    /*
     * Poll the REAL Explorer.
     */

    for (
      let attempt = 1;
      attempt <= 36;
      attempt++
    ) {
      setMessage(
        `Waiting for Explorer verification... (${attempt}/36)`
      );

      const result =
        await checkExplorer(
          contract
        );

      /*
       * ONLY Explorer confirmation
       * can produce verified.
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

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            2500
          )
      );
    }

    /*
     * Verification was submitted but
     * Explorer did not confirm it.
     */

    setState("deployed");

    setMessage(
      "Verification was submitted, but the IOPn Explorer has not confirmed the source code yet."
    );

    return false;
  }

  /*
   * -------------------------------------------------------
   * DEPLOY
   * -------------------------------------------------------
   */

  async function deploy() {
    setError("");
    setMessage("");
    setContractAddress("");
    setTransactionHash("");
    setVerificationId(null);

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
       * STEP 1
       *
       * Load exact compiled artifact.
       */

      setState("deploying");

      setMessage(
        "Loading the exact IOPnToken deployment artifact..."
      );

      const artifact =
        await loadArtifact();

      /*
       * STEP 2
       *
       * Deploy.
       */

      setMessage(
        "Deploying IOPnToken..."
      );

      const hash =
        await walletClient.deployContract(
          {
            abi:
              artifact.artifact!.abi,

            bytecode:
              artifact.artifact!
                .bytecode as `0x${string}`,

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
       * STEP 3
       *
       * Wait for receipt.
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
       * STEP 4
       *
       * Get actual contract address.
       */

      const deployedAddress =
        receipt.contractAddress;

      if (
        !deployedAddress
      ) {
        throw new Error(
          "Deployment succeeded but no contract address was returned."
        );
      }

      setContractAddress(
        deployedAddress
      );

      setState("deployed");

      setMessage(
        "Contract deployed successfully. Checking IOPn Explorer..."
      );

      /*
       * STEP 5
       *
       * Check Explorer.
       */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * Explorer already verified.
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
       * STEP 6
       *
       * Submit automatic verification.
       *
       * Even if Explorer hasn't indexed
       * yet, we can submit the request.
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

  const isBusy =
    state === "deploying" ||
    state === "indexing" ||
    state === "verifying";

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-cyan-400">
            OPN CHAIN
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Create Your Token. Have Fun on OPN.
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Create and deploy your own token
            on the OPN Chain testnet. Choose
            a name, symbol, supply and decimals,
            then deploy directly from your wallet.
          </p>
        </div>

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
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-50"
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
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-50"
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
            className="mb-5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-50"
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
            className="mb-6 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-cyan-500 disabled:opacity-50"
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
            {state ===
            "deploying"
              ? "Deploying..."
              : state ===
                "indexing"
              ? "Checking Explorer..."
              : state ===
                "verifying"
              ? "Verifying..."
              : state ===
                "verified"
              ? "Verified"
              : "Create Token"}
          </button>

          {!isConnected && (
            <p className="mt-3 text-center text-sm text-yellow-400">
              Connect your wallet to create a token.
            </p>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

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

          {verificationId && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                Verification Request
              </p>

              <p className="break-all font-mono text-xs text-zinc-500">
                {verificationId}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                Submission does not mean verified.
                The IOPn Explorer must confirm the
                source code.
              </p>
            </div>
          )}

          {state === "verified" &&
            contractAddress && (
              <div className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950/30 p-5">
                <p className="font-semibold text-emerald-300">
                  ✓ Verified on IOPn Explorer
                </p>

                <p className="mt-2 text-sm text-emerald-400/70">
                  Explorer-confirmed source code
                  verification.
                </p>

                <a
                  href={`${EXPLORER_URL}/address/${contractAddress}?tab=contract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  Confirm on Explorer →
                </a>
              </div>
            )}

          {contractAddress &&
            state === "deployed" && (
              <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/20 p-5">
                <p className="font-semibold text-yellow-300">
                  Contract deployed — not verified
                </p>

                <p className="mt-2 text-sm leading-6 text-yellow-400/70">
                  The contract exists on OPN Chain,
                  but the Explorer has not confirmed
                  source-code verification.
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

          {state === "failed" && (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950/20 p-5">
              <p className="font-semibold text-red-300">
                Deployment failed
              </p>
            </div>
          )}
        </div>

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