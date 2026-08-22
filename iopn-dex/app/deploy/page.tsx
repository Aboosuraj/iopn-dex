"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { encodeAbiParameters, parseEther } from "viem";
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

/*
 * AUTOMATIC LIQUIDITY ALLOCATION
 *
 * 20% of the newly deployed token supply is reserved
 * for the initial liquidity pool.
 *
 * The token side is calculated automatically.
 *
 * The OPN side is supplied by the deployer.
 */
const INITIAL_LIQUIDITY_OPN = "1";

/*
 * Percentage of the newly deployed token supply
 * automatically allocated to the first liquidity pool.
 */
const LIQUIDITY_TOKEN_PERCENT = 20n;

/* =========================================================
   DEX CONFIG
========================================================= */

const ROUTER_ADDRESS =
  "0xB489bce5c9c9364da2D1D1Bc5CE4274F63141885" as `0x${string}`;

const FACTORY_ADDRESS =
  "0x8860242B65611dfd077aEe26C3C7920813dF9208" as `0x${string}`;

const WOPN_ADDRESS =
  "0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84" as `0x${string}`;

const OPN_ADDRESS =
  "0xA463ce9F738E0B4035D8d036B902D0efADb24d20" as `0x${string}`;

/* =========================================================
   TYPES
========================================================= */

type DeploymentState =
  | "idle"
  | "deploying"
  | "deployed"
  | "indexing"
  | "verifying"
  | "liquidity"
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
   ERC20 ABI
========================================================= */

const ERC20_LIQUIDITY_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const;

/* =========================================================
   FACTORY ABI
========================================================= */

const FACTORY_ABI = [
  {
    type: "function",
    name: "getPair",
    stateMutability: "view",
    inputs: [
      {
        name: "tokenA",
        type: "address",
      },
      {
        name: "tokenB",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "pair",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "createPair",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "tokenA",
        type: "address",
      },
      {
        name: "tokenB",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "pair",
        type: "address",
      },
    ],
  },
] as const;

/* =========================================================
   ROUTER ABI
========================================================= */

const ROUTER_LIQUIDITY_ABI = [
  {
    type: "function",
    name: "addLiquidityOPN",
    stateMutability: "payable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "amountTokenDesired",
        type: "uint256",
      },
      {
        name: "amountTokenMin",
        type: "uint256",
      },
      {
        name: "amountOPNMin",
        type: "uint256",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "amountToken",
        type: "uint256",
      },
      {
        name: "amountOPN",
        type: "uint256",
      },
      {
        name: "liquidity",
        type: "uint256",
      },
    ],
  },
] as const;

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

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [decimals, setDecimals] = useState("18");

  /* =======================================================
     DEPLOYMENT STATE
  ======================================================= */

  const [contractAddress, setContractAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const [state, setState] =
    useState<DeploymentState>("idle");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [verificationId, setVerificationId] =
    useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  /* =======================================================
     LIQUIDITY STATE
  ======================================================= */

  const [liquidityPairAddress, setLiquidityPairAddress] =
    useState("");

  const [liquidityTransactionHash, setLiquidityTransactionHash] =
    useState("");

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
     LOAD STANDARD JSON
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
        "Unable to load IOPnToken standard input."
      );
    }

    const data = await response.json();

    if (
      !data?.success ||
      typeof data.standardInput !== "string" ||
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
     WAIT FOR INDEXING
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

      /*
       * If Explorer somehow reports the contract as
       * already verified, we can continue directly.
       */
      if (result.verified) {
        return {
          verified: true,
          indexed: true,
        };
      }

      if (result.indexed) {
        setMessage(
          "✓ Contract indexed by IOPn Explorer. Preparing automatic verification..."
        );

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
            name: "tokenName",
            type: "string",
          },
          {
            name: "tokenSymbol",
            type: "string",
          },
          {
            name: "initialSupply",
            type: "uint256",
          },
          {
            name: "tokenDecimals",
            type: "uint8",
          },
          {
            name: "initialOwner",
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
     AUTOMATIC LIQUIDITY
     
     IMPORTANT:
     
     This function is ONLY called after verification
     has already been confirmed.
  ======================================================= */

  async function createAutomaticLiquidity(
    tokenAddress: `0x${string}`,
    totalSupply: bigint
  ) {
    if (!address) {
      throw new Error(
        "Wallet address is unavailable for liquidity creation."
      );
    }

    if (!walletClient) {
      throw new Error(
        "Wallet client is unavailable for liquidity creation."
      );
    }

    if (!publicClient) {
      throw new Error(
        "Blockchain client is unavailable for liquidity creation."
      );
    }

    /*
     * IMPORTANT:
     *
     * This function is reached only after Explorer
     * verification has been confirmed.
     */
    setState("liquidity");

    setMessage(
      "✓ Contract verification confirmed. Preparing the automatic OPN liquidity pool..."
    );

    /*
     * 20% of the deployed token supply.
     */
    const liquidityTokenAmount =
      (totalSupply *
        LIQUIDITY_TOKEN_PERCENT) /
      100n;

    if (liquidityTokenAmount <= 0n) {
      throw new Error(
        "The calculated liquidity token allocation is zero."
      );
    }

    /*
     * OPN side of the pool.
     */
    const liquidityOPNAmount =
      parseEther(
        INITIAL_LIQUIDITY_OPN
      );

    if (liquidityOPNAmount <= 0n) {
      throw new Error(
        "Initial OPN liquidity amount must be greater than zero."
      );
    }

    /*
     * Check wallet OPN balance.
     */
    const nativeBalance =
      await publicClient.getBalance({
        address,
      });

    if (
      nativeBalance <
      liquidityOPNAmount
    ) {
      throw new Error(
        `Insufficient OPN balance for automatic liquidity. Required ${INITIAL_LIQUIDITY_OPN} OPN.`
      );
    }

    /*
     * Check newly deployed token balance.
     */
    const tokenBalance =
      await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_LIQUIDITY_ABI,
        functionName: "balanceOf",
        args: [address],
      });

    if (
      tokenBalance <
      liquidityTokenAmount
    ) {
      throw new Error(
        "The deployer wallet does not contain enough newly deployed tokens for the 20% liquidity allocation."
      );
    }

    /* =====================================================
       STEP A — CHECK / CREATE PAIR
    ===================================================== */

    setMessage(
      "Verification confirmed. Preparing the automatic OPN liquidity pool..."
    );

    let pairAddress =
      await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "getPair",
        args: [
          tokenAddress,
          WOPN_ADDRESS,
        ],
      });

    /*
     * Viem returns zero address when the pair
     * does not exist.
     */
    if (
      pairAddress ===
      "0x0000000000000000000000000000000000000000"
    ) {
      setMessage(
        "Verification confirmed. Creating the new OPN liquidity pair..."
      );

      const createPairHash =
        await walletClient.writeContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "createPair",
          args: [
            tokenAddress,
            WOPN_ADDRESS,
          ],
          account: address,
          chain: walletClient.chain,
        });

      await publicClient.waitForTransactionReceipt(
        {
          hash: createPairHash,
        }
      );

      /*
       * Read pair again after creation.
       */
      pairAddress =
        await publicClient.readContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "getPair",
          args: [
            tokenAddress,
            WOPN_ADDRESS,
          ],
        });
    }

    if (
      pairAddress ===
      "0x0000000000000000000000000000000000000000"
    ) {
      throw new Error(
        "The liquidity pair could not be created."
      );
    }

    setLiquidityPairAddress(
      pairAddress
    );

    /* =====================================================
       STEP B — APPROVE ROUTER
    ===================================================== */

    setMessage(
      "Approving 20% of your token supply for the verified token's liquidity pool..."
    );

    const approvalHash =
      await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_LIQUIDITY_ABI,
        functionName: "approve",
        args: [
          ROUTER_ADDRESS,
          liquidityTokenAmount,
        ],
        account: address,
        chain: walletClient.chain,
      });

    await publicClient.waitForTransactionReceipt(
      {
        hash: approvalHash,
      }
    );

    /* =====================================================
       STEP C — ADD OPN LIQUIDITY
    ===================================================== */

    setMessage(
      `Adding ${LIQUIDITY_TOKEN_PERCENT.toString()}% of the verified token supply and ${INITIAL_LIQUIDITY_OPN} OPN to the initial liquidity pool...`
    );

    /*
     * 1% slippage protection.
     */
    const amountTokenMin =
      (liquidityTokenAmount *
        99n) /
      100n;

    const amountOPNMin =
      (liquidityOPNAmount *
        99n) /
      100n;

    /*
     * Five-minute deadline.
     */
    const deadline =
      BigInt(
        Math.floor(
          Date.now() / 1000
        ) + 300
      );

    const liquidityHash =
      await walletClient.writeContract({
        address: ROUTER_ADDRESS,
        abi: ROUTER_LIQUIDITY_ABI,
        functionName: "addLiquidityOPN",
        args: [
          tokenAddress,
          liquidityTokenAmount,
          amountTokenMin,
          amountOPNMin,
          address,
          deadline,
        ],
        value: liquidityOPNAmount,
        account: address,
        chain: walletClient.chain,
      });

    setLiquidityTransactionHash(
      liquidityHash
    );

    await publicClient.waitForTransactionReceipt(
      {
        hash: liquidityHash,
      }
    );

    setMessage(
      `✓ Verified token liquidity created successfully. ${LIQUIDITY_TOKEN_PERCENT.toString()}% of the token supply was allocated to the initial OPN liquidity pool.`
    );

    return {
      pairAddress,
      liquidityHash,
      tokenAmount:
        liquidityTokenAmount,
      opnAmount:
        liquidityOPNAmount,
    };
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

    const response = await fetch(
      "/api/markets/verify-token",
      {
        method: "POST",
        cache: "no-store",
        body: form,
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
     * Check immediately after submission.
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
     * Wait for actual Explorer confirmation.
     *
     * We do NOT consider submission itself to mean
     * verification succeeded.
     */
    for (
      let attempt = 1;
      attempt <= 30;
      attempt++
    ) {
      setState("verifying");

      setMessage(
        `Waiting for Explorer verification confirmation... (${attempt}/30)`
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 2500)
      );

      const result =
        await checkExplorer(contract);

      /*
       * Only this condition allows liquidity
       * creation to continue.
       */
      if (result.verified) {
        setState("verified");

        setMessage(
          "✓ Verified on IOPn Explorer. Verification confirmed. Preparing automatic liquidity..."
        );

        return true;
      }
    }

    /*
     * Verification was not confirmed.
     *
     * IMPORTANT:
     *
     * Return false so deploy() stops before
     * automatic liquidity.
     */
    setState("deployed");

    setMessage(
      data.message ||
        "Verification was submitted, but the Explorer has not confirmed the source code as verified. Automatic liquidity was not created."
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
    setLiquidityPairAddress("");
    setLiquidityTransactionHash("");

    /* =====================================================
       WALLET
    ===================================================== */

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

    /* =====================================================
       VALIDATION
    ===================================================== */

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
        "Total supply is required."
      );
      return;
    }

    if (!decimals.trim()) {
      setError(
        "Decimals are required."
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

    /* =====================================================
       EXACT SUPPLY
    ===================================================== */

    let totalSupply: bigint;

    try {
      const cleanSupply =
        supply
          .trim()
          .replace(/,/g, "");

      if (!/^\d+$/.test(cleanSupply)) {
        throw new Error(
          "Supply must contain whole numbers only."
        );
      }

      totalSupply =
        BigInt(cleanSupply);

      if (totalSupply <= 0n) {
        throw new Error(
          "Supply must be greater than zero."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid token supply."
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

              /*
               * EXACT USER SUPPLY
               */
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
         STEP 3 — ADDRESS
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
        "Token deployed successfully. Waiting for Explorer indexing before automatic verification..."
      );

      /* =================================================
         STEP 4 — EXPLORER INDEXING
      ================================================= */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * If the contract was somehow already verified,
       * skip the verification submission and proceed.
       */
      let verified =
        explorerState.verified;

      /* =================================================
         STEP 5 — AUTOMATIC VERIFICATION
      ================================================= */

      if (!verified) {
        verified =
          await verifyContract(
            deployedAddress,
            totalSupply,
            decimalsNumber
          );
      }

      /* =================================================
         IMPORTANT SAFETY CHECK
         
         Liquidity MUST NOT happen unless the Explorer
         has confirmed verification.
      ================================================= */

      if (!verified) {
        throw new Error(
          "Token deployment succeeded, but Explorer verification was not confirmed. Automatic liquidity was NOT created."
        );
      }

      /* =================================================
         STEP 6 — VERIFIED
      ================================================= */

      setState("verified");

      setMessage(
        "✓ Contract verified on IOPn Explorer. Verification confirmed. Starting automatic liquidity..."
      );

      /*
       * Small UI pause so the user can clearly see
       * the verification stage before liquidity starts.
       */
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );

      /* =================================================
         STEP 7 — AUTOMATIC LIQUIDITY
      ================================================= */

      await createAutomaticLiquidity(
        deployedAddress,
        totalSupply
      );

      /* =================================================
         STEP 8 — COMPLETE
      ================================================= */

      setState("verified");

      setMessage(
        `✓ Token deployed, verified on IOPn Explorer, and initial liquidity pool created successfully. ${LIQUIDITY_TOKEN_PERCENT.toString()}% of the token supply was allocated to liquidity.`
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
     COPY
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
    state === "verifying" ||
    state === "liquidity";

  const explorerContractUrl =
    contractAddress
      ? `${EXPLORER_URL}/address/${contractAddress}?tab=contract`
      : "";

  const explorerTransactionUrl =
    transactionHash
      ? `${EXPLORER_URL}/tx/${transactionHash}`
      : "";

  const explorerLiquidityTransactionUrl =
    liquidityTransactionHash
      ? `${EXPLORER_URL}/tx/${liquidityTransactionHash}`
      : "";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[380px] w-[380px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute left-[-150px] top-[45%] h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

      </div>

      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">

        {/* NAV */}

        <div className="mb-10 flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-cyan-400/30 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-xs font-medium text-cyan-300">
              OPN TESTNET
            </span>

          </div>

        </div>

        {/* HERO */}

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
            directly from your wallet.
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

        {/* MAIN CARD */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/40 backdrop-blur-xl">

          <div className="border-b border-white/10 px-5 py-5 sm:px-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">

                <FileCode2 size={20} />

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

          <div className="space-y-5 p-5 sm:p-7">

            {/* NAME */}

            <div>

              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Token name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={isBusy}
                placeholder="e.g. My Token"
                autoComplete="off"
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
                    event.target.value.toUpperCase()
                  )
                }
                disabled={isBusy}
                placeholder="e.g. MTK"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm uppercase text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
              />

            </div>

            {/* SUPPLY + DECIMALS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* SUPPLY */}

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Total supply
                </label>

                <input
                  value={supply}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /[^\d,]/g,
                        ""
                      );

                    setSupply(value);
                  }}
                  disabled={isBusy}
                  inputMode="numeric"
                  placeholder="e.g. 1000000000"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Enter the exact token supply
                </p>

              </div>

              {/* DECIMALS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Decimals
                </label>

                <input
                  value={decimals}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setDecimals(value);
                  }}
                  disabled={isBusy}
                  inputMode="numeric"
                  autoComplete="off"
                  min={0}
                  max={18}
                  className="w-full rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-3.5 text-sm font-semibold text-cyan-300 outline-none transition focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Default: 18 • Maximum: 18
                </p>

              </div>

            </div>

            {/* SUPPLY PREVIEW */}

            {supply.trim() && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">

                <div className="flex items-center justify-between gap-4">

                  <span className="text-xs text-zinc-500">
                    On-chain total supply
                  </span>

                  <span className="font-mono text-sm font-semibold text-cyan-300">
                    {supply.replace(
                      /,/g,
                      ""
                    )}
                  </span>

                </div>

                <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                  This value is deployed exactly as
                  entered. No automatic 10^18
                  multiplication is applied.
                </p>

              </div>
            )}

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

                    {state === "deploying"
                      ? "Deploying Token..."
                      : state === "indexing"
                      ? "Checking Explorer..."
                      : state === "verifying"
                      ? "Verifying Contract..."
                      : "Adding Initial Liquidity..."}
                  </>
                ) : state === "verified" ? (
                  <>
                    <Check size={18} />
                    Verified & Liquidity Created
                  </>
                ) : (
                  <>
                    <Rocket size={18} />
                    Deploy Token
                  </>
                )}

              </button>

              {!isConnected && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-400">

                  <Wallet size={14} />

                  Connect your wallet
                  to deploy

                </div>
              )}

            </div>

            {/* STATUS */}

            {message && (
              <div
                className={`rounded-xl border p-4 ${
                  state === "verified"
                    ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                    : state === "failed"
                    ? "border-red-400/20 bg-red-400/[0.05]"
                    : state === "liquidity"
                    ? "border-blue-400/20 bg-blue-400/[0.05]"
                    : "border-cyan-400/10 bg-cyan-400/[0.03]"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 shrink-0">

                    {state === "verified" ? (
                      <Check
                        size={17}
                        className="text-emerald-400"
                      />
                    ) : state === "liquidity" ? (
                      <Loader2
                        size={17}
                        className="animate-spin text-blue-400"
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

        {/* DEPLOYMENT RESULT */}

        {contractAddress && (
          <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl">

            <div className="border-b border-white/10 px-5 py-5 sm:px-7">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    state === "verified"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : state === "liquidity"
                      ? "bg-blue-400/10 text-blue-400"
                      : "bg-blue-400/10 text-blue-400"
                  }`}
                >

                  {state === "verified" ? (
                    <ShieldCheck size={20} />
                  ) : state === "liquidity" ? (
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                  ) : (
                    <Rocket size={20} />
                  )}

                </div>

                <div>

                  <h2 className="font-semibold">

                    {state === "verified"
                      ? "Token Verified & Liquidity Created"
                      : state === "liquidity"
                      ? "Verified — Creating Liquidity"
                      : "Token Deployed"}

                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-500">

                    {state === "verified"
                      ? "Verified by the IOPn Explorer and added to the liquidity pool"
                      : state === "liquidity"
                      ? "Explorer verification confirmed"
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
                        <Check size={13} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy
                      </>
                    )}

                  </button>

                </div>

                <p className="break-all font-mono text-xs leading-6 text-zinc-300 sm:text-sm">
                  {contractAddress}
                </p>

                <a
                  href={explorerContractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  View contract on Explorer
                  <ExternalLink size={13} />
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
                    href={explorerTransactionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                  >
                    View transaction
                    <ExternalLink size={13} />
                  </a>

                </div>
              )}

              {/* LIQUIDITY */}

              {liquidityPairAddress && (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">

                      <Rocket size={17} />

                    </div>

                    <div>

                      <p className="font-semibold text-cyan-300">
                        Initial Liquidity Created
                      </p>

                      <p className="mt-1 text-xs leading-5 text-cyan-400/60">
                        The contract was verified on
                        the IOPn Explorer before
                        liquidity creation.{" "}
                        {LIQUIDITY_TOKEN_PERCENT.toString()}%
                        of the token supply was
                        automatically allocated to
                        the initial OPN liquidity pool.
                      </p>

                    </div>

                  </div>

                  <div className="mt-4">

                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Pair address
                    </p>

                    <p className="mt-1 break-all font-mono text-[11px] leading-5 text-zinc-500">
                      {liquidityPairAddress}
                    </p>

                  </div>

                  {liquidityTransactionHash && (
                    <a
                      href={
                        explorerLiquidityTransactionUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
                    >
                      View liquidity transaction
                      <ExternalLink size={13} />
                    </a>
                  )}

                </div>
              )}

              {/* VERIFIED */}

              {state === "verified" && (
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
                        Verified on IOPn Explorer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                        The Explorer confirmed the
                        published source code before
                        the automatic liquidity pool
                        was created.
                      </p>

                    </div>

                  </div>

                  <a
                    href={explorerContractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                  >
                    Confirm on Explorer
                    <ExternalLink size={13} />
                  </a>

                </div>
              )}

              {/* NOT VERIFIED */}

              {state === "deployed" && (
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
                        The contract is live,
                        but Explorer verification
                        has not yet been confirmed.
                        Automatic liquidity has
                        not been created.
                      </p>

                    </div>

                  </div>

                  <a
                    href={explorerContractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                  >
                    Open Explorer
                    <ExternalLink size={13} />
                  </a>

                </div>
              )}

              {/* VERIFICATION ID */}

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

        {/* FOOTER */}

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