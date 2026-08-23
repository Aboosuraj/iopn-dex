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
  formatUnits,
  parseUnits,
} from "viem";
import type { Address, Hash } from "viem";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  FileCode2,
  Loader2,
  Rocket,
  ShieldCheck,
  Wallet,
} from "lucide-react";

/* =========================================================
   EXPLORER
========================================================= */

const EXPLORER_URL = "https://testnet.iopn.tech";

/* =========================================================
   INITIAL LIQUIDITY CONFIG
========================================================= */

/*
 * Amount of native OPN supplied to the initial pool.
 *
 * Example:
 * 1 OPN + 4,000,000 TOKEN
 */
const INITIAL_LIQUIDITY_OPN = "1";

/*
 * Percentage of the HUMAN token supply allocated
 * to the initial liquidity pool.
 */
const LIQUIDITY_TOKEN_PERCENT = 20n;

/* =========================================================
   DEX CONFIG
========================================================= */

const ROUTER_ADDRESS =
  "0xB489bce5c9c9364da2D1D1Bc5CE4274F63141885" as Address;

const FACTORY_ADDRESS =
  "0x8860242B65611dfd077aEe26C3C7920813dF9208" as Address;

const WOPN_ADDRESS =
  "0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84" as Address;

const OPN_ADDRESS =
  "0xA463ce9F738E0B4035D8d036B902D0efADb24d20" as Address;

/*
 * IMPORTANT:
 *
 * The pair is created as:
 *
 * TOKEN / WOPN
 *
 * Native OPN is supplied to the router.
 * The router internally handles the native OPN side.
 */

/* =========================================================
   TYPES
========================================================= */

type DeploymentState =
  | "idle"
  | "deploying"
  | "indexing"
  | "verifying"
  | "pairing"
  | "liquidity"
  | "checking"
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

type BalanceCheck = {
  deployerBalance: bigint;
  pairBalance: bigint;
  expectedDeployerBalance: bigint;
  expectedPairBalance: bigint;
  totalSupply: bigint;
  liquidityAmount: bigint;
};

/* =========================================================
   ERC20 ABI
========================================================= */

const ERC20_ABI = [
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
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
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

const ROUTER_ABI = [
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
   ZERO ADDRESS
========================================================= */

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

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

  const [contractAddress, setContractAddress] =
    useState<Address | "">("");

  const [transactionHash, setTransactionHash] =
    useState<Hash | "">("");

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
    useState<Address | "">("");

  const [liquidityTransactionHash, setLiquidityTransactionHash] =
    useState<Hash | "">("");

  const [liquidityTokenAmount, setLiquidityTokenAmount] =
    useState<bigint | null>(null);

  const [liquidityOPNAmount, setLiquidityOPNAmount] =
    useState<bigint | null>(null);

  /* =======================================================
     BALANCE VERIFICATION
  ======================================================= */

  const [balanceCheck, setBalanceCheck] =
    useState<BalanceCheck | null>(null);

  /* =========================================================
     LOAD ARTIFACT
  ========================================================= */

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

  /* =========================================================
     LOAD STANDARD JSON
  ========================================================= */

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
      typeof data.standardInput !==
        "string" ||
      !data.standardInput.trim()
    ) {
      throw new Error(
        "IOPnToken Standard JSON input is unavailable."
      );
    }

    JSON.parse(data.standardInput);

    return data.standardInput;
  }

  /* =========================================================
     EXPLORER CHECK
  ========================================================= */

  async function checkExplorer(
    contract: string
  ) {
    try {
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

  /* =========================================================
     WAIT FOR EXPLORER INDEXING
  ========================================================= */

  async function waitForIndexing(
    contract: Address
  ) {
    setState("indexing");

    setMessage(
      "Waiting for IOPn Explorer to index the deployed contract..."
    );

    for (
      let attempt = 1;
      attempt <= 30;
      attempt++
    ) {
      const result =
        await checkExplorer(contract);

      if (result.verified) {
        return {
          verified: true,
          indexed: true,
        };
      }

      if (result.indexed) {
        setMessage(
          "✓ Explorer indexed the contract. Starting automatic verification..."
        );

        return {
          verified: false,
          indexed: true,
        };
      }

      setMessage(
        `Waiting for Explorer indexing... (${attempt}/30)`
      );

      if (attempt < 30) {
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 2000)
        );
      }
    }

    return {
      verified: false,
      indexed: false,
    };
  }

  /* =========================================================
     CONSTRUCTOR ARGUMENTS
  ========================================================= */

  function encodeConstructorArguments(
    tokenName: string,
    tokenSymbol: string,
    totalSupplyBaseUnits: bigint,
    tokenDecimals: number,
    owner: Address
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
          totalSupplyBaseUnits,
          tokenDecimals,
          owner,
        ]
      );

    return encoded.slice(2);
  }

  /* =========================================================
     AUTOMATIC VERIFICATION
  ========================================================= */

  async function verifyContract(
    contract: Address,
    totalSupplyBaseUnits: bigint,
    tokenDecimals: number
  ) {
    if (!address) {
      throw new Error(
        "Wallet address is unavailable for verification."
      );
    }

    setState("verifying");

    setMessage(
      "Submitting the exact Standard JSON compilation to the IOPn Explorer..."
    );

    const standardInput =
      await loadStandardInput();

    /*
     * IMPORTANT:
     *
     * Verification receives the SAME base-unit
     * supply that was used during deployment.
     */
    const constructorArgs =
      encodeConstructorArguments(
        name.trim(),
        symbol.trim(),
        totalSupplyBaseUnits,
        tokenDecimals,
        address
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

    const response =
      await fetch(
        "/api/markets/verify-token",
        {
          method: "POST",
          cache: "no-store",
          body: form,
        }
      );

    let data: VerificationResponse;

    try {
      data =
        (await response.json()) as VerificationResponse;
    } catch {
      throw new Error(
        "Explorer verification endpoint returned an invalid response."
      );
    }

    if (data.verificationId) {
      setVerificationId(
        data.verificationId
      );
    }

    if (
      !response.ok ||
      data.success === false ||
      data.error
    ) {
      throw new Error(
        data.error ||
          data.message ||
          "Automatic Explorer verification submission failed."
      );
    }

    const immediate =
      await checkExplorer(contract);

    if (immediate.verified) {
      setState("verified");

      setMessage(
        "✓ Explorer confirms that the contract source code is verified."
      );

      return true;
    }

    for (
      let attempt = 1;
      attempt <= 40;
      attempt++
    ) {
      setState("verifying");

      setMessage(
        `Waiting for Explorer verification... (${attempt}/40)`
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 2500)
      );

      const result =
        await checkExplorer(contract);

      if (result.verified) {
        setState("verified");

        setMessage(
          "✓ Verified on IOPn Explorer."
        );

        return true;
      }
    }

    setState("failed");

    throw new Error(
      data.message ||
        "Contract deployment succeeded, but Explorer verification was not confirmed. Liquidity was not created."
    );
  }

  /* =========================================================
     GET OR CREATE TOKEN/WOPN PAIR
  ========================================================= */

  async function getOrCreatePair(
    tokenAddress: Address
  ): Promise<Address> {
    if (!address) {
      throw new Error(
        "Wallet address is unavailable."
      );
    }

    if (!walletClient) {
      throw new Error(
        "Wallet client is unavailable."
      );
    }

    if (!publicClient) {
      throw new Error(
        "Blockchain client is unavailable."
      );
    }

    setState("pairing");

    setMessage(
      "Contract verified. Checking for the TOKEN/WOPN liquidity pair..."
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
     * PAIR DOES NOT EXIST
     *
     * Create it BEFORE adding liquidity.
     */
    if (
      pairAddress === ZERO_ADDRESS
    ) {
      setMessage(
        "No TOKEN/WOPN pair exists. Creating the pair first..."
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

      setMessage(
        "TOKEN/WOPN pair transaction submitted. Waiting for confirmation..."
      );

      const receipt =
        await publicClient.waitForTransactionReceipt(
          {
            hash: createPairHash,
          }
        );

      if (
        receipt.status !==
        "success"
      ) {
        throw new Error(
          "TOKEN/WOPN pair creation transaction failed."
        );
      }

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
      pairAddress === ZERO_ADDRESS
    ) {
      throw new Error(
        "The TOKEN/WOPN pair could not be created or found."
      );
    }

    setLiquidityPairAddress(
      pairAddress
    );

    setMessage(
      `✓ TOKEN/WOPN pair ready: ${pairAddress}`
    );

    return pairAddress;
  }

  /* =========================================================
     CREATE AUTOMATIC LIQUIDITY
  ========================================================= */

  async function createAutomaticLiquidity(
    tokenAddress: Address,
    totalSupplyBaseUnits: bigint,
    tokenDecimals: number
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
     * ======================================================
     * STEP 1
     *
     * CALCULATE 20% IN BASE UNITS
     * ======================================================
     *
     * Example:
     *
     * Human supply:
     * 20,000,000
     *
     * Base supply:
     * 20,000,000 × 10^18
     *
     * 20%:
     * 4,000,000 × 10^18
     */

    const liquidityTokenAmount =
      (totalSupplyBaseUnits *
        LIQUIDITY_TOKEN_PERCENT) /
      100n;

    if (
      liquidityTokenAmount <= 0n
    ) {
      throw new Error(
        "The calculated liquidity token allocation is zero."
      );
    }

    /*
     * Native OPN amount.
     */
    const liquidityOPNAmount =
      parseUnits(
        INITIAL_LIQUIDITY_OPN,
        18
      );

    if (
      liquidityOPNAmount <= 0n
    ) {
      throw new Error(
        "Initial OPN liquidity amount must be greater than zero."
      );
    }

    setLiquidityTokenAmount(
      liquidityTokenAmount
    );

    setLiquidityOPNAmount(
      liquidityOPNAmount
    );

    /*
     * ======================================================
     * STEP 2
     *
     * CHECK NATIVE OPN BALANCE
     * ======================================================
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
        `Insufficient OPN balance. Required ${INITIAL_LIQUIDITY_OPN} OPN.`
      );
    }

    /*
     * ======================================================
     * STEP 3
     *
     * CHECK TOKEN BALANCE
     * ======================================================
     */

    const tokenBalance =
      await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

    if (
      tokenBalance <
      liquidityTokenAmount
    ) {
      throw new Error(
        "The deployer wallet does not contain enough tokens for the 20% liquidity allocation."
      );
    }

    /*
     * ======================================================
     * STEP 4
     *
     * CREATE / GET TOKEN-WOPN PAIR
     * ======================================================
     */

    const pairAddress =
      await getOrCreatePair(
        tokenAddress
      );

    /*
     * ======================================================
     * STEP 5
     *
     * APPROVE EXACTLY 20%
     * ======================================================
     */

    setState("liquidity");

    setMessage(
      `Approving ${formatUnits(
        liquidityTokenAmount,
        tokenDecimals
      )} ${symbol.toUpperCase()} for the liquidity router...`
    );

    const approvalHash =
      await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
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

    /*
     * ======================================================
     * STEP 6
     *
     * ADD INITIAL TOKEN/WOPN LIQUIDITY
     * ======================================================
     */

    setMessage(
      `Adding ${formatUnits(
        liquidityTokenAmount,
        tokenDecimals
      )} ${symbol.toUpperCase()} + ${INITIAL_LIQUIDITY_OPN} OPN to the initial pool...`
    );

    /*
     * 1% slippage protection.
     */
    const amountTokenMin =
      (liquidityTokenAmount * 99n) /
      100n;

    const amountOPNMin =
      (liquidityOPNAmount * 99n) /
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
        abi: ROUTER_ABI,
        functionName:
          "addLiquidityOPN",
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

    setMessage(
      "Liquidity transaction submitted. Waiting for confirmation..."
    );

    const liquidityReceipt =
      await publicClient.waitForTransactionReceipt(
        {
          hash: liquidityHash,
        }
      );

    if (
      liquidityReceipt.status !==
      "success"
    ) {
      throw new Error(
        "Initial liquidity transaction failed."
      );
    }

    /*
     * ======================================================
     * STEP 7
     *
     * VERIFY ON-CHAIN BALANCES
     * ======================================================
     */

    setState("checking");

    setMessage(
      "Liquidity confirmed. Verifying the final token distribution on-chain..."
    );

    const finalDeployerBalance =
      await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });

    const finalPairBalance =
      await publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [pairAddress],
      });

    const expectedLiquidity =
      liquidityTokenAmount;

    const expectedDeployer =
      totalSupplyBaseUnits -
      liquidityTokenAmount;

    setBalanceCheck({
      deployerBalance:
        finalDeployerBalance,

      pairBalance:
        finalPairBalance,

      expectedDeployerBalance:
        expectedDeployer,

      expectedPairBalance:
        expectedLiquidity,

      totalSupply:
        totalSupplyBaseUnits,

      liquidityAmount:
        liquidityTokenAmount,
    });

    /*
     * Allow a small difference because the router
     * can use slightly different amounts depending
     * on implementation.
     */
    const pairDifference =
      finalPairBalance >
      expectedLiquidity
        ? finalPairBalance -
          expectedLiquidity
        : expectedLiquidity -
          finalPairBalance;

    const deployerDifference =
      finalDeployerBalance >
      expectedDeployer
        ? finalDeployerBalance -
          expectedDeployer
        : expectedDeployer -
          finalDeployerBalance;

    /*
     * 0.01% tolerance.
     */
    const tolerance =
      totalSupplyBaseUnits /
      10000n;

    if (
      pairDifference >
        tolerance ||
      deployerDifference >
        tolerance
    ) {
      throw new Error(
        "Liquidity transaction succeeded, but the final on-chain token distribution does not match the expected 80% deployer / 20% liquidity allocation."
      );
    }

    /*
     * ======================================================
     * FINAL SUCCESS
     * ======================================================
     */

    setState("verified");

    setMessage(
      `✓ Token paired successfully, 20% initial liquidity added, and on-chain balances verified.`
    );

    return {
      pairAddress,
      liquidityHash,
      tokenAmount:
        liquidityTokenAmount,
      opnAmount:
        liquidityOPNAmount,
      deployerBalance:
        finalDeployerBalance,
      pairBalance:
        finalPairBalance,
    };
  }

  /* =========================================================
     DEPLOY
  ========================================================= */

  async function deploy() {
    setError("");

    setMessage("");

    setContractAddress("");

    setTransactionHash("");

    setVerificationId(null);

    setCopied(false);

    setLiquidityPairAddress("");

    setLiquidityTransactionHash("");

    setLiquidityTokenAmount(null);

    setLiquidityOPNAmount(null);

    setBalanceCheck(null);

    setState("idle");

    /*
     * ======================================================
     * WALLET
     * ======================================================
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
     * ======================================================
     * VALIDATION
     * ======================================================
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

    /*
     * ======================================================
     * HUMAN SUPPLY
     * ======================================================
     *
     * User enters:
     *
     * 20,000,000
     *
     * This is NOT the value sent directly to
     * the ERC20 constructor.
     */

    let humanSupply: string;

    let totalSupplyBaseUnits: bigint;

    try {
      humanSupply =
        supply
          .trim()
          .replace(/,/g, "");

      /*
       * Whole token supply only.
       */
      if (
        !/^\d+$/.test(
          humanSupply
        )
      ) {
        throw new Error(
          "Supply must contain whole numbers only."
        );
      }

      /*
       * ==================================================
       * CRITICAL FIX
       *
       * Convert:
       *
       * 20,000,000
       *
       * into:
       *
       * 20,000,000 × 10^18
       *
       * when decimals = 18.
       * ==================================================
       */

      totalSupplyBaseUnits =
        parseUnits(
          humanSupply,
          decimalsNumber
        );

      if (
        totalSupplyBaseUnits <=
        0n
      ) {
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

    /*
     * ======================================================
     * START PROCESS
     * ======================================================
     */

    try {
      /*
       * ====================================================
       * STEP 1
       *
       * DEPLOY
       * ====================================================
       */

      setState("deploying");

      setMessage(
        `Deploying ${humanSupply} ${symbol.toUpperCase()} with ${decimalsNumber} decimals...`
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

      /*
       * IMPORTANT:
       *
       * Deploy BASE UNITS.
       *
       * Example:
       *
       * User:
       * 20,000,000
       *
       * Constructor:
       * 20,000,000 × 10^18
       */

      const hash =
        await walletClient.deployContract(
          {
            abi: artifact.abi,

            bytecode:
              artifact.bytecode as `0x${string}`,

            args: [
              name.trim(),

              symbol.trim(),

              totalSupplyBaseUnits,

              decimalsNumber,

              address,
            ],
          }
        );

      setTransactionHash(
        hash
      );

      setMessage(
        "Deployment transaction submitted. Waiting for blockchain confirmation..."
      );

      /*
       * ====================================================
       * STEP 2
       *
       * DEPLOYMENT RECEIPT
       * ====================================================
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
       * ====================================================
       * STEP 3
       *
       * CONTRACT ADDRESS
       * ====================================================
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

      /*
       * ====================================================
       * STEP 4
       *
       * WAIT FOR EXPLORER INDEXING
       * ====================================================
       */

      const explorerState =
        await waitForIndexing(
          deployedAddress
        );

      /*
       * ====================================================
       * STEP 5
       *
       * VERIFY
       * ====================================================
       */

      let verified =
        explorerState.verified;

      if (!verified) {
        verified =
          await verifyContract(
            deployedAddress,
            totalSupplyBaseUnits,
            decimalsNumber
          );
      }

      /*
       * ABSOLUTE SAFETY CHECK
       */

      if (!verified) {
        throw new Error(
          "Explorer verification was not confirmed. Pair and liquidity creation were not started."
        );
      }

      /*
       * ====================================================
       * STEP 6
       *
       * VERIFIED
       * ====================================================
       */

      setState("verified");

      setMessage(
        "✓ Contract verified. Now creating the TOKEN/WOPN pair before adding liquidity..."
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );

      /*
       * ====================================================
       * STEP 7
       *
       * PAIR + LIQUIDITY
       *
       * Order:
       *
       * 1. Get/create TOKEN/WOPN pair
       * 2. Calculate 20%
       * 3. Approve 20%
       * 4. Add liquidity
       * 5. Verify balances
       * ====================================================
       */

      await createAutomaticLiquidity(
        deployedAddress,
        totalSupplyBaseUnits,
        decimalsNumber
      );

      /*
       * ====================================================
       * STEP 8
       *
       * FINAL SUCCESS
       * ====================================================
       */

      setState("verified");

      setMessage(
        `✓ ${humanSupply} ${symbol.toUpperCase()} deployed, verified, paired with WOPN, 20% initial liquidity added, and final balances verified on-chain.`
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

  /* =========================================================
     COPY
  ========================================================= */

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

  /* =========================================================
     UI STATE
  ========================================================= */

  const isBusy =
    state === "deploying" ||
    state === "indexing" ||
    state === "verifying" ||
    state === "pairing" ||
    state === "liquidity" ||
    state === "checking";

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

  /* =========================================================
     DISPLAY VALUES
  ========================================================= */

  const displayLiquidityTokens =
    liquidityTokenAmount !== null
      ? formatUnits(
          liquidityTokenAmount,
          Number(decimals)
        )
      : "";

  const displayExpectedDeployer =
    balanceCheck
      ? formatUnits(
          balanceCheck.expectedDeployerBalance,
          Number(decimals)
        )
      : "";

  const displayActualDeployer =
    balanceCheck
      ? formatUnits(
          balanceCheck.deployerBalance,
          Number(decimals)
        )
      : "";

  const displayExpectedPair =
    balanceCheck
      ? formatUnits(
          balanceCheck.expectedPairBalance,
          Number(decimals)
        )
      : "";

  const displayActualPair =
    balanceCheck
      ? formatUnits(
          balanceCheck.pairBalance,
          Number(decimals)
        )
      : "";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

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
            backgroundSize:
              "42px 42px",
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
            Chain testnet. Your token is
            deployed, verified, paired, and
            supplied with initial liquidity
            automatically.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              ⚡ Fast deployment
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              🔐 Wallet controlled
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              🔗 TOKEN/WOPN paired
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
                  setName(
                    event.target.value
                  )
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
                  placeholder="e.g. 20000000"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Enter the human-readable
                  token supply
                </p>

              </div>

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
                    Human-readable supply
                  </span>

                  <span className="font-mono text-sm font-semibold text-cyan-300">
                    {supply.replace(
                      /,/g,
                      ""
                    )}
                  </span>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">

                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Liquidity 20%
                    </p>

                    <p className="mt-1 text-sm font-semibold text-cyan-300">

                      {(() => {

                        try {

                          const human =
                            supply
                              .replace(
                                /,/g,
                                ""
                              );

                          const parsed =
                            parseUnits(
                              human,
                              Number(decimals)
                            );

                          const liquidity =
                            (parsed *
                              20n) /
                            100n;

                          return formatUnits(
                            liquidity,
                            Number(decimals)
                          );

                        } catch {

                          return "—";

                        }

                      })()}

                    </p>

                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">

                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Deployer 80%
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-300">

                      {(() => {

                        try {

                          const human =
                            supply
                              .replace(
                                /,/g,
                                ""
                              );

                          const parsed =
                            parseUnits(
                              human,
                              Number(decimals)
                            );

                          const liquidity =
                            (parsed *
                              20n) /
                            100n;

                          const deployer =
                            parsed -
                            liquidity;

                          return formatUnits(
                            deployer,
                            Number(decimals)
                          );

                        } catch {

                          return "—";

                        }

                      })()}

                    </p>

                  </div>

                </div>

                <p className="mt-3 text-[11px] leading-5 text-zinc-600">
                  The supply is converted to
                  ERC-20 base units using the
                  selected decimals before
                  deployment. With 20,000,000
                  supply and 18 decimals, the
                  contract receives
                  20,000,000 × 10¹⁸ base units.
                </p>

              </div>
            )}

            {/* PROCESS PREVIEW */}

            <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/60">
                Automatic deployment flow
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 sm:grid-cols-4">

                <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <span className="block text-cyan-400">
                    01
                  </span>
                  Deploy
                </div>

                <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <span className="block text-cyan-400">
                    02
                  </span>
                  Verify
                </div>

                <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <span className="block text-cyan-400">
                    03
                  </span>
                  Pair
                </div>

                <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <span className="block text-cyan-400">
                    04
                  </span>
                  Add 20%
                </div>

              </div>

            </div>

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

                    {state ===
                    "deploying"
                      ? "Deploying Token..."
                      : state ===
                        "indexing"
                      ? "Waiting for Explorer..."
                      : state ===
                        "verifying"
                      ? "Verifying Contract..."
                      : state ===
                        "pairing"
                      ? "Creating Token Pair..."
                      : state ===
                        "liquidity"
                      ? "Adding Liquidity..."
                      : "Checking On-Chain Balances..."}
                  </>
                ) : state ===
                  "verified" ? (
                  <>
                    <Check size={18} />
                    Verified
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
                  state ===
                  "verified"
                    ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                    : state ===
                      "failed"
                    ? "border-red-400/20 bg-red-400/[0.05]"
                    : "border-cyan-400/10 bg-cyan-400/[0.03]"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 shrink-0">

                    {state ===
                    "verified" ? (
                      <Check
                        size={17}
                        className="text-emerald-400"
                      />
                    ) : state ===
                      "failed" ? (
                      <ShieldCheck
                        size={17}
                        className="text-red-400"
                      />
                    ) : (
                      <Loader2
                        size={17}
                        className="animate-spin text-cyan-400"
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
                    state ===
                    "verified"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : state ===
                        "failed"
                      ? "bg-red-400/10 text-red-400"
                      : "bg-blue-400/10 text-blue-400"
                  }`}
                >

                  {state ===
                  "verified" ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <Rocket size={20} />
                  )}

                </div>

                <div>

                  <h2 className="font-semibold">

                    {state ===
                    "verified"
                      ? "Token Verified & Liquidity Created"
                      : state ===
                        "failed"
                      ? "Token Deployed"
                      : "Token Deployed"}

                  </h2>

                  <p className="mt-0.5 text-xs text-zinc-500">

                    {state ===
                    "verified"
                      ? "Verified, paired with WOPN, liquidity added and balances verified"
                      : "Your contract is live on OPN Chain"}

                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-4 p-5 sm:p-7">

              {/* CONTRACT */}

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
                  href={
                    explorerContractUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  View contract on Explorer
                  <ExternalLink size={13} />
                </a>

              </div>

              {/* DEPLOYMENT TX */}

              {transactionHash && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">

                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    Deployment transaction
                  </p>

                  <p className="break-all font-mono text-xs leading-6 text-zinc-500">
                    {transactionHash}
                  </p>

                  <a
                    href={
                      explorerTransactionUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                  >
                    View transaction
                    <ExternalLink size={13} />
                  </a>

                </div>
              )}

              {/* PAIR */}

              {liquidityPairAddress && (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                      <Rocket size={17} />
                    </div>

                    <div>

                      <p className="font-semibold text-cyan-300">
                        TOKEN/WOPN Pair Ready
                      </p>

                      <p className="mt-1 text-xs leading-5 text-cyan-400/60">
                        The liquidity pair was
                        created before the
                        initial liquidity was
                        supplied.
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

                </div>
              )}

              {/* LIQUIDITY */}

              {liquidityTokenAmount !==
                null &&
                liquidityPairAddress && (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                        <Rocket size={17} />
                      </div>

                      <div>

                        <p className="font-semibold text-cyan-300">
                          Initial Liquidity Added
                        </p>

                        <p className="mt-1 text-xs leading-5 text-cyan-400/60">
                          Exactly{" "}
                          {LIQUIDITY_TOKEN_PERCENT.toString()}
                          % of the token
                          supply was allocated
                          to the initial pool.
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                          Token liquidity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-cyan-300">
                          {displayLiquidityTokens}
                        </p>

                        <p className="text-[10px] text-zinc-600">
                          {symbol.toUpperCase()}
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                          OPN liquidity
                        </p>

                        <p className="mt-1 text-sm font-semibold text-cyan-300">
                          {liquidityOPNAmount !==
                          null
                            ? formatUnits(
                                liquidityOPNAmount,
                                18
                              )
                            : "—"}
                        </p>

                        <p className="text-[10px] text-zinc-600">
                          OPN
                        </p>

                      </div>

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

              {/* BALANCE VERIFICATION */}

              {balanceCheck && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-black">
                      <Check
                        size={18}
                        strokeWidth={3}
                      />
                    </div>

                    <div>

                      <p className="font-semibold text-emerald-300">
                        On-Chain Distribution Verified
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                        The final balances match
                        the expected 80% deployer
                        and 20% liquidity
                        allocation.
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs text-zinc-500">
                          Deployer
                        </span>

                        <span className="font-mono text-xs text-emerald-300">
                          {displayActualDeployer}
                        </span>

                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">

                        <span className="text-[10px] text-zinc-700">
                          Expected
                        </span>

                        <span className="font-mono text-[10px] text-zinc-600">
                          {displayExpectedDeployer}
                        </span>

                      </div>

                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">

                      <div className="flex items-center justify-between gap-3">

                        <span className="text-xs text-zinc-500">
                          Liquidity Pair
                        </span>

                        <span className="font-mono text-xs text-cyan-300">
                          {displayActualPair}
                        </span>

                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">

                        <span className="text-[10px] text-zinc-700">
                          Expected
                        </span>

                        <span className="font-mono text-[10px] text-zinc-600">
                          {displayExpectedPair}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* FINAL VERIFIED */}

              {state ===
                "verified" &&
                liquidityPairAddress && (
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
                          Verified & Ready to Trade
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                          The token is deployed,
                          Explorer verified,
                          paired with WOPN,
                          initial liquidity added,
                          and the final token
                          distribution was
                          verified on-chain.
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] text-emerald-300">
                        ✓ Deployed
                      </span>

                      <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] text-emerald-300">
                        ✓ Verified
                      </span>

                      <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] text-emerald-300">
                        ✓ Pair Created
                      </span>

                      <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] text-emerald-300">
                        ✓ Liquidity Added
                      </span>

                    </div>

                    <a
                      href={
                        explorerContractUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                    >
                      Confirm on Explorer
                      <ExternalLink size={13} />
                    </a>

                  </div>
                )}

              {/* FAILED */}

              {state ===
                "failed" && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                        !
                      </div>

                      <div>

                        <p className="font-semibold text-red-300">
                          Automatic Process Stopped
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-400/60">
                          The contract may already
                          exist on-chain. The
                          automatic process stopped
                          because one of the
                          verification, pair creation,
                          liquidity, or balance
                          verification steps failed.
                        </p>

                      </div>

                    </div>

                    <a
                      href={
                        explorerContractUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-300 transition hover:text-red-200"
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