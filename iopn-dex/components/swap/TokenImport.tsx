"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Coins,
  X,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  isAddress,
} from "viem";

import {
  usePublicClient,
} from "wagmi";

import {
  ERC20_ABI,
} from "@/lib/erc20";

import {
  saveImportedToken,
} from "@/lib/importedTokens";

type Token = {
  symbol: string;
  name?: string;
  address: string;
  decimals: number;
  native: false;
  imported?: true;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (token: Token) => void;
};

export default function TokenImport({
  open,
  onClose,
  onImport,
}: Props) {
  const publicClient =
    usePublicClient();

  const [address, setAddress] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!open) {
      setAddress("");
      setLoading(false);
      setError("");
      setSuccess("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function submit() {
    const trimmed =
      address.trim();

    setError("");
    setSuccess("");

    if (!isAddress(trimmed)) {
      setError(
        "Enter a valid IOPn contract address."
      );
      return;
    }

    if (!publicClient) {
      setError(
        "Blockchain connection unavailable."
      );
      return;
    }

    setLoading(true);

    try {
      const contractAddress =
        trimmed as `0x${string}`;

      const [
        symbol,
        name,
        decimals,
      ] = await Promise.all([
        publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: "symbol",
        }),

        publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: "name",
        }),

        publicClient.readContract({
          address: contractAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);

      const token: Token = {
        symbol: String(symbol),
        name: String(name),
        address: contractAddress,
        decimals: Number(decimals),
        native: false,
        imported: true,
      };

      /*
       * Persist it immediately.
       */
      saveImportedToken({
        symbol: token.symbol,
        name:
          token.name ||
          token.symbol,
        address: token.address,
        decimals: token.decimals,
        native: false,
        imported: true,
      });

      /*
       * Update the swap page immediately.
       */
      onImport(token);

      setSuccess(
        `${token.symbol} imported successfully.`
      );

      setAddress("");

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        "Token import failed:",
        error
      );

      setError(
        "This contract does not appear to be a valid ERC-20 token on IOPn."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-end
        justify-center
        bg-black/70
        backdrop-blur-md
        sm:items-center
        sm:px-4
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-t-[2rem]
          border
          border-white/10
          bg-[#080d1d]
          p-6
          text-white
          shadow-[0_0_70px_rgba(6,182,212,0.12)]
          sm:rounded-[2rem]
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-cyan-400/10
                text-cyan-400
              "
            >
              <Coins size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Import Token
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Read the token directly from IOPn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/[0.04]
              text-white/50
              transition
              hover:border-cyan-400/30
              hover:text-cyan-400
            "
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="token-address"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-white/60
            "
          >
            Contract Address
          </label>

          <input
            id="token-address"
            value={address}
            onChange={(event) => {
              setAddress(
                event.target.value
              );
              setError("");
              setSuccess("");
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !loading
              ) {
                submit();
              }
            }}
            placeholder="0x..."
            disabled={loading}
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-4
              font-mono
              text-sm
              text-white
              outline-none
              placeholder:text-white/25
              transition
              focus:border-cyan-400/50
              focus:bg-white/[0.06]
              disabled:opacity-50
            "
          />
        </div>

        {error && (
          <div
            className="
              mt-4
              flex
              items-start
              gap-2
              rounded-2xl
              border
              border-red-400/20
              bg-red-400/[0.06]
              p-3
              text-xs
              text-red-300
            "
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-emerald-400/20
              bg-emerald-400/[0.06]
              p-3
              text-xs
              text-emerald-300
            "
          >
            <CheckCircle2 size={16} />

            <span>{success}</span>
          </div>
        )}

        <div
          className="
            mt-5
            flex
            gap-3
            rounded-2xl
            border
            border-amber-400/10
            bg-amber-400/[0.04]
            p-4
          "
        >
          <ShieldCheck
            size={19}
            className="
              mt-0.5
              shrink-0
              text-amber-400
            "
          />

          <p className="text-xs leading-5 text-white/45">
            The token symbol, name and decimals
            are read directly from the IOPn
            blockchain. Only import contracts
            you trust.
          </p>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={
            loading ||
            !isAddress(address.trim())
          }
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-cyan-400
            py-4
            font-black
            text-black
            transition
            hover:bg-cyan-300
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Reading IOPn Contract...
            </>
          ) : (
            "Import Token"
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            mt-3
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            py-4
            font-bold
            text-white/70
            transition
            hover:bg-white/[0.06]
            hover:text-white
            disabled:opacity-40
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}