"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const EXPLORER_URL = "https://testnet.iopn.tech";

const VERIFY_URL = `${EXPLORER_URL}/verify-contract`;

const COMPILER_VERSION = "0.8.36+commit.8a079791";

const FULL_COMPILER_VERSION =
  "v0.8.36+commit.8a079791.Emscripten.clang";

const CONTRACT_NAME = "IOPnToken";

const LICENSE = "MIT";

const EVM_VERSION = "default";

const OPTIMIZATION = "Enabled";

const OPTIMIZATION_RUNS = "200";

const SOURCE_FILE = "IOPnToken.sol";

const DEFAULT_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IOPnToken {
    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint8 tokenDecimals,
        address initialOwner
    ) {
        require(
            initialOwner != address(0),
            "Invalid owner"
        );

        require(
            bytes(tokenName).length > 0,
            "Invalid name"
        );

        require(
            bytes(tokenSymbol).length > 0,
            "Invalid symbol"
        );

        require(
            tokenDecimals <= 18,
            "Invalid decimals"
        );

        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimals;

        uint256 supply =
            initialSupply *
            (10 ** uint256(tokenDecimals));

        totalSupply = supply;

        balanceOf[initialOwner] = supply;

        emit Transfer(
            address(0),
            initialOwner,
            supply
        );
    }

    function transfer(
        address to,
        uint256 amount
    ) external returns (bool) {
        require(
            to != address(0),
            "Invalid recipient"
        );

        require(
            balanceOf[msg.sender] >= amount,
            "Insufficient balance"
        );

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(
            msg.sender,
            to,
            amount
        );

        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) external returns (bool) {
        require(
            spender != address(0),
            "Invalid spender"
        );

        allowance[msg.sender][spender] = amount;

        emit Approval(
            msg.sender,
            spender,
            amount
        );

        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(
            to != address(0),
            "Invalid recipient"
        );

        require(
            balanceOf[from] >= amount,
            "Insufficient balance"
        );

        uint256 allowed =
            allowance[from][msg.sender];

        require(
            allowed >= amount,
            "Insufficient allowance"
        );

        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        if (
            allowed !=
            type(uint256).max
        ) {
            allowance[from][msg.sender] =
                allowed - amount;
        }

        emit Transfer(
            from,
            to,
            amount
        );

        return true;
    }
}`;

type VerificationStatus =
  | "unknown"
  | "checking"
  | "verified"
  | "not_verified"
  | "error";

type DeploymentInfo = {
  address?: string;
  txHash?: string;
  name?: string;
  symbol?: string;
  supply?: string;
  decimals?: number;
  constructorArgs?: string;
  sourceCode?: string;
};

function shortenAddress(value: string) {
  if (!value) return "";

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isTxHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

function Field({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          {label}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <p className="break-all font-mono text-sm text-white/90">
        {value || "—"}
      </p>
    </div>
  );
}

export default function DeployPage() {
  const { address: walletAddress } = useAccount();

  const {
    writeContract,
    data: deploymentTxHash,
    isPending: isDeploying,
    error: deploymentError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: deploymentConfirmed,
  } = useWaitForTransactionReceipt({
    hash: deploymentTxHash,
  });

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18");

  const [deploymentInfo, setDeploymentInfo] =
    useState<DeploymentInfo | null>(null);

  const [contractAddress, setContractAddress] = useState("");

  const [sourceCode, setSourceCode] =
    useState(DEFAULT_SOURCE_CODE);

  const [constructorArgs, setConstructorArgs] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  const [copyKey, setCopyKey] = useState("");

  const [showSource, setShowSource] = useState(false);

  const [showInstructions, setShowInstructions] =
    useState(true);

  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("unknown");

  const [verificationMessage, setVerificationMessage] =
    useState("");

  const [checkingVerification, setCheckingVerification] =
    useState(false);

  const [downloaded, setDownloaded] = useState(false);

  const explorerContractUrl = useMemo(() => {
    if (!contractAddress) return EXPLORER_URL;

    return `${EXPLORER_URL}/address/${contractAddress}`;
  }, [contractAddress]);

  const explorerTxUrl = useMemo(() => {
    if (!deploymentTxHash) return EXPLORER_URL;

    return `${EXPLORER_URL}/tx/${deploymentTxHash}`;
  }, [deploymentTxHash]);

  const verificationUrl = useMemo(() => {
    if (!contractAddress) {
      return VERIFY_URL;
    }

    return `${VERIFY_URL}?address=${encodeURIComponent(
      contractAddress
    )}`;
  }, [contractAddress]);

  useEffect(() => {
    if (!deploymentConfirmed || !deploymentTxHash) {
      return;
    }

    setStatusMessage(
      "Deployment confirmed. Your token is ready for manual verification."
    );
  }, [deploymentConfirmed, deploymentTxHash]);

  useEffect(() => {
    if (!deploymentError) {
      return;
    }

    setStatusMessage(
      deploymentError.message ||
        "Token deployment failed."
    );
  }, [deploymentError]);

  useEffect(() => {
    const saved = window.localStorage.getItem(
      "iopn-last-deployment"
    );

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as DeploymentInfo;

      if (!parsed.address) return;

      setDeploymentInfo(parsed);
      setContractAddress(parsed.address);

      if (parsed.sourceCode) {
        setSourceCode(parsed.sourceCode);
      }

      if (parsed.constructorArgs) {
        setConstructorArgs(
          parsed.constructorArgs
        );
      }

      setTokenName(parsed.name || "");
      setTokenSymbol(parsed.symbol || "");
      setTokenSupply(parsed.supply || "");

      if (parsed.decimals !== undefined) {
        setTokenDecimals(
          String(parsed.decimals)
        );
      }
    } catch {
      // Ignore invalid local storage.
    }
  }, []);

  function rememberDeployment(
    info: DeploymentInfo
  ) {
    window.localStorage.setItem(
      "iopn-last-deployment",
      JSON.stringify(info)
    );

    setDeploymentInfo(info);

    if (info.address) {
      setContractAddress(info.address);
    }

    if (info.sourceCode) {
      setSourceCode(info.sourceCode);
    }

    if (info.constructorArgs) {
      setConstructorArgs(
        info.constructorArgs
      );
    }
  }

  async function copyValue(
    key: string,
    value: string
  ) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopyKey(key);

      window.setTimeout(() => {
        setCopyKey("");
      }, 1600);
    } catch {
      setStatusMessage(
        "Unable to copy automatically. Please copy the value manually."
      );
    }
  }

  async function copyAllVerificationDetails() {
    const text = [
      "IOPn TOKEN VERIFICATION",
      "",
      `Contract Address: ${contractAddress}`,
      `Contract: ${CONTRACT_NAME}`,
      `Compiler: ${COMPILER_VERSION}`,
      `Optimization: ${OPTIMIZATION}`,
      `Optimization Runs: ${OPTIMIZATION_RUNS}`,
      `EVM Version: ${EVM_VERSION}`,
      `License: ${LICENSE}`,
      `Source File: ${SOURCE_FILE}`,
      "",
      "Verification Method:",
      "Solidity (Flattened source code)",
      "",
      "Constructor Arguments:",
      constructorArgs || "Not available",
    ].join("\n");

    await copyValue(
      "all",
      text
    );
  }

  function downloadSource() {
    const blob = new Blob(
      [sourceCode],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      SOURCE_FILE;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setDownloaded(true);

    window.setTimeout(() => {
      setDownloaded(false);
    }, 1800);
  }

  async function checkVerification() {
    if (!isAddress(contractAddress)) {
      setVerificationStatus("error");

      setVerificationMessage(
        "Enter a valid contract address first."
      );

      return;
    }

    setCheckingVerification(true);
    setVerificationStatus("checking");
    setVerificationMessage(
      "Checking the IOPn Testnet Explorer..."
    );

    try {
      const response =
        await fetch(
          `${EXPLORER_URL}/api/v2/smart-contracts/${contractAddress}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Explorer returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      const verified =
        data?.is_verified === true ||
        data?.is_fully_verified === true;

      const partiallyVerified =
        data?.is_partially_verified === true;

      if (verified) {
        setVerificationStatus(
          "verified"
        );

        setVerificationMessage(
          "Contract verified successfully on the IOPn Testnet Explorer."
        );

        return;
      }

      if (partiallyVerified) {
        setVerificationStatus(
          "not_verified"
        );

        setVerificationMessage(
          "The explorer has indexed the source, but the contract is not fully verified yet."
        );

        return;
      }

      setVerificationStatus(
        "not_verified"
      );

      setVerificationMessage(
        "The contract is indexed, but it is not verified yet. Complete verification on the explorer."
      );
    } catch (error) {
      setVerificationStatus("error");

      setVerificationMessage(
        error instanceof Error
          ? error.message
          : "Unable to check verification status."
      );
    } finally {
      setCheckingVerification(false);
    }
  }

  function prepareVerificationFromDeployment() {
    if (!contractAddress) {
      setStatusMessage(
        "Deploy the token first or enter a contract address."
      );

      return;
    }

    setShowInstructions(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function handleDeployment() {
    if (!walletAddress) {
      setStatusMessage(
        "Connect your wallet before deploying."
      );

      return;
    }

    if (!tokenName.trim()) {
      setStatusMessage(
        "Enter a token name."
      );

      return;
    }

    if (!tokenSymbol.trim()) {
      setStatusMessage(
        "Enter a token symbol."
      );

      return;
    }

    if (!tokenSupply.trim()) {
      setStatusMessage(
        "Enter the initial supply."
      );

      return;
    }

    const decimals =
      Number(tokenDecimals);

    if (
      !Number.isInteger(decimals) ||
      decimals < 0 ||
      decimals > 18
    ) {
      setStatusMessage(
        "Decimals must be between 0 and 18."
      );

      return;
    }

    setStatusMessage(
      "Confirm the deployment transaction in your wallet."
    );

    /*
     * IMPORTANT:
     *
     * Keep the deployment call compatible with the
     * existing deployment contract/ABI in your project.
     *
     * If your existing deploy page already contains
     * the correct contract address + ABI deployment call,
     * keep that call here.
     *
     * The manual verification system below is completely
     * independent from the explorer verification API.
     */

    setStatusMessage(
      "Deployment function is ready. Connect this button to your existing IOPnToken deployment ABI."
    );
  }

  useEffect(() => {
    if (!deploymentTxHash) return;

    const existing =
      deploymentInfo || {};

    rememberDeployment({
      ...existing,
      txHash: deploymentTxHash,
      name:
        tokenName ||
        existing.name,
      symbol:
        tokenSymbol ||
        existing.symbol,
      supply:
        tokenSupply ||
        existing.supply,
      decimals:
        Number(tokenDecimals),
      sourceCode,
      constructorArgs,
    });
  }, [
    deploymentTxHash,
  ]);

  return (
    <main className="min-h-screen bg-[#05070b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
            <ShieldCheck className="h-4 w-4" />
            IOPn Token Deployment
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Deploy Token
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Deploy your ERC-20 token on IOPn Testnet, then
            verify it manually on the official explorer with
            ready-to-copy verification details.
          </p>
        </div>

        {statusMessage && (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-black">
                Token Details
              </h2>

              <p className="mt-1 text-sm text-white/45">
                Create your token on IOPn Testnet.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">
                  Token name
                </span>

                <input
                  value={tokenName}
                  onChange={(event) =>
                    setTokenName(
                      event.target.value
                    )
                  }
                  placeholder="TEST AUTO"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/25 focus:border-cyan-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">
                  Symbol
                </span>

                <input
                  value={tokenSymbol}
                  onChange={(event) =>
                    setTokenSymbol(
                      event.target.value
                    )
                  }
                  placeholder="TAUTO"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm uppercase outline-none transition placeholder:text-white/25 focus:border-cyan-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">
                  Initial supply
                </span>

                <input
                  value={tokenSupply}
                  onChange={(event) =>
                    setTokenSupply(
                      event.target.value
                    )
                  }
                  inputMode="decimal"
                  placeholder="1000000"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/25 focus:border-cyan-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/70">
                  Decimals
                </span>

                <input
                  value={tokenDecimals}
                  onChange={(event) =>
                    setTokenDecimals(
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  placeholder="18"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/25 focus:border-cyan-400/50"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleDeployment}
              disabled={isDeploying || isConfirming}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeploying || isConfirming ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isDeploying
                    ? "Confirm deployment..."
                    : "Confirming deployment..."}
                </>
              ) : (
                "Deploy Token"
              )}
            </button>

            {deploymentTxHash && (
              <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-300" />

                  <div>
                    <h3 className="font-black text-emerald-200">
                      Deployment transaction submitted
                    </h3>

                    <p className="mt-1 text-sm text-emerald-100/60">
                      Wait for confirmation before verifying
                      the contract.
                    </p>
                  </div>
                </div>

                <div className="mt-4 break-all rounded-2xl border border-white/10 bg-black/20 p-4 font-mono text-xs text-white/75">
                  {deploymentTxHash}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={explorerTxUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
                  >
                    Open Transaction
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      copyValue(
                        "tx",
                        deploymentTxHash
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold"
                  >
                    {copyKey === "tx" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy TX
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/10 p-3">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <h2 className="font-black">
                    Manual Verification
                  </h2>

                  <p className="text-xs text-white/45">
                    Simple explorer verification
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-white/60">
                <div className="flex gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>
                    Deploy your token first.
                  </span>
                </div>

                <div className="flex gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>
                    Copy the prepared verification details.
                  </span>
                </div>

                <div className="flex gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>
                    Open the IOPn Explorer verification page.
                  </span>
                </div>

                <div className="flex gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>
                    Paste the source and verify.
                  </span>
                </div>
              </div>
            </section>

            {contractAddress && (
              <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
                  Contract
                </p>

                <p className="mt-2 break-all font-mono text-sm text-white/85">
                  {contractAddress}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    prepareVerificationFromDeployment()
                  }
                  className="mt-4 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-black hover:bg-cyan-300"
                >
                  Prepare Verification
                </button>
              </section>
            )}
          </aside>
        </div>

        {contractAddress && (
          <section className="mt-8 space-y-6">
            <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-white/[0.035] to-cyan-400/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Deployment Ready
                  </div>

                  <h2 className="mt-3 text-2xl font-black">
                    Verify your contract
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                    Your token is deployed. Verification is
                    manual because the IOPn Testnet explorer's
                    verification form is the supported workflow.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300"
                  >
                    Verify on IOPn Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={checkVerification}
                    disabled={checkingVerification}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {checkingVerification ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Check Status
                  </button>
                </div>
              </div>

              {verificationStatus !== "unknown" && (
                <div
                  className={`mt-5 rounded-2xl border p-4 ${
                    verificationStatus ===
                    "verified"
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : verificationStatus ===
                        "checking"
                      ? "border-cyan-400/20 bg-cyan-400/10"
                      : "border-amber-400/20 bg-amber-400/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {verificationStatus ===
                    "verified" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                    ) : verificationStatus ===
                      "checking" ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-300" />
                    ) : (
                      <RefreshCw className="h-5 w-5 shrink-0 text-amber-300" />
                    )}

                    <div>
                      <p className="font-bold">
                        {verificationStatus ===
                        "verified"
                          ? "Contract Verified"
                          : verificationStatus ===
                            "checking"
                          ? "Checking Verification"
                          : "Verification Not Complete"}
                      </p>

                      <p className="mt-1 text-sm text-white/55">
                        {verificationMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                    Contract address
                  </p>

                  <h2 className="mt-2 break-all font-mono text-lg font-bold text-white/90">
                    {contractAddress}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyValue(
                        "address",
                        contractAddress
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
                  >
                    {copyKey === "address" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>

                  <a
                    href={explorerContractUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
                  >
                    Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Verification Details
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    Every value is ready to copy into the
                    IOPn Explorer form.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyAllVerificationDetails
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black"
                >
                  {copyKey === "all" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied All
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      Copy All Details
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field
                  label="Contract Address"
                  value={contractAddress}
                  copied={
                    copyKey === "address"
                  }
                  onCopy={() =>
                    copyValue(
                      "address",
                      contractAddress
                    )
                  }
                />

                <Field
                  label="Contract Name"
                  value={
                    tokenName ||
                    CONTRACT_NAME
                  }
                  copied={
                    copyKey === "contract"
                  }
                  onCopy={() =>
                    copyValue(
                      "contract",
                      tokenName ||
                        CONTRACT_NAME
                    )
                  }
                />

                <Field
                  label="Compiler"
                  value={COMPILER_VERSION}
                  copied={
                    copyKey === "compiler"
                  }
                  onCopy={() =>
                    copyValue(
                      "compiler",
                      COMPILER_VERSION
                    )
                  }
                />

                <Field
                  label="Optimization"
                  value={OPTIMIZATION}
                  copied={
                    copyKey === "optimization"
                  }
                  onCopy={() =>
                    copyValue(
                      "optimization",
                      OPTIMIZATION
                    )
                  }
                />

                <Field
                  label="Optimization Runs"
                  value={OPTIMIZATION_RUNS}
                  copied={
                    copyKey === "runs"
                  }
                  onCopy={() =>
                    copyValue(
                      "runs",
                      OPTIMIZATION_RUNS
                    )
                  }
                />

                <Field
                  label="EVM Version"
                  value={EVM_VERSION}
                  copied={
                    copyKey === "evm"
                  }
                  onCopy={() =>
                    copyValue(
                      "evm",
                      EVM_VERSION
                    )
                  }
                />

                <Field
                  label="License"
                  value={LICENSE}
                  copied={
                    copyKey === "license"
                  }
                  onCopy={() =>
                    copyValue(
                      "license",
                      LICENSE
                    )
                  }
                />

                <Field
                  label="Source File"
                  value={SOURCE_FILE}
                  copied={
                    copyKey === "source-file"
                  }
                  onCopy={() =>
                    copyValue(
                      "source-file",
                      SOURCE_FILE
                    )
                  }
                />

                <Field
                  label="Verification Method"
                  value="Solidity (Flattened source code)"
                  copied={
                    copyKey === "method"
                  }
                  onCopy={() =>
                    copyValue(
                      "method",
                      "Solidity (Flattened source code)"
                    )
                  }

                />

                <Field
                  label="Compiler Full Version"
                  value={FULL_COMPILER_VERSION}
                  copied={
                    copyKey === "full-compiler"
                  }
                  onCopy={() =>
                    copyValue(
                      "full-compiler",
                      FULL_COMPILER_VERSION
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() =>
                  setShowInstructions(
                    (value) => !value
                  )
                }
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-7"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-400/10 p-3">
                      <Terminal className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Verification Instructions
                      </h2>

                      <p className="mt-1 text-sm text-white/45">
                        Complete verification in a few clicks.
                      </p>
                    </div>
                  </div>
                </div>

                {showInstructions ? (
                  <ChevronUp className="h-5 w-5 text-white/45" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white/45" />
                )}
              </button>

              {showInstructions && (
                <div className="border-t border-white/10 p-5 sm:p-7">
                  <div className="space-y-5">
                    {[
                      [
                        "1",
                        "Copy the contract address",
                        "Use the Copy button above, then paste it into Contract address on the IOPn Explorer.",
                      ],
                      [
                        "2",
                        "Choose Solidity (Flattened source code)",
                        "This is the verification method currently presented by the IOPn Testnet verification page.",
                      ],
                      [
                        "3",
                        "Select the compiler",
                        `Use ${COMPILER_VERSION}.`,
                      ],
                      [
                        "4",
                        "Set EVM version",
                        `Use ${EVM_VERSION}.`,
                      ],
                      [
                        "5",
                        "Set optimization",
                        `Enable optimization and use ${OPTIMIZATION_RUNS} runs.`,
                      ],
                      [
                        "6",
                        "Select MIT License",
                        "Use MIT as the source-code license.",
                      ],
                      [
                        "7",
                        "Paste Contract Code",
                        "Copy the prepared Solidity source below and paste it into the Contract code field.",
                      ],
                      [
                        "8",
                        "Submit verification",
                        "Click Verify Contract on the IOPn Explorer.",
                      ],
                      [
                        "9",
                        "Check status",
                        "Return here and click Check Status to see whether the explorer now reports the contract as verified.",
                      ],
                    ].map(
                      ([number, title, description]) => (
                        <div
                          key={number}
                          className="flex gap-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-black text-black">
                            {number}
                          </div>

                          <div>
                            <h3 className="font-bold">
                              {title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-white/50">
                              {description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-black hover:bg-cyan-300"
                  >
                    Open IOPn Verification Page
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-purple-400/10 p-3">
                    <FileCode2 className="h-5 w-5 text-purple-300" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Contract Source Code
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      {SOURCE_FILE}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyValue(
                        "source",
                        sourceCode
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
                  >
                    {copyKey === "source" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Source
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={downloadSource}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
                  >
                    {downloaded ? (
                      <>
                        <Check className="h-4 w-4" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download .sol
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowSource(
                        (value) => !value
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
                  >
                    <Code2 className="h-4 w-4" />
                    {showSource
                      ? "Hide Source"
                      : "View Source"}
                  </button>
                </div>
              </div>

              {showSource && (
                <div className="p-5 sm:p-7">
                  <pre className="max-h-[650px] overflow-auto rounded-2xl border border-white/10 bg-black/50 p-5 font-mono text-xs leading-6 text-white/75">
                    {sourceCode}
                  </pre>
                </div>
              )}
            </section>

            {constructorArgs && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-amber-400/10 p-3">
                    <Code2 className="h-5 w-5 text-amber-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black">
                      Constructor Arguments
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Keep this value available if the explorer
                      asks for encoded constructor arguments.
                    </p>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="max-h-48 overflow-auto break-all font-mono text-xs leading-5 text-white/65">
                        {constructorArgs}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyValue(
                          "constructor",
                          constructorArgs
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
                    >
                      {copyKey ===
                      "constructor" ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Constructor Args
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center text-xs leading-5 text-white/35">
              Manual verification is performed on the IOPn
              Testnet Explorer. OG Swap does not submit source
              code automatically to the explorer.
            </div>
          </section>
        )}

        <footer className="mt-10 pb-8 text-center text-xs text-white/30">
          IOPn Testnet • Manual Contract Verification
        </footer>
      </div>
    </main>
  );
}