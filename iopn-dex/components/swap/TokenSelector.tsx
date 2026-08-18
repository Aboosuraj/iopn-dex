"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Copy,
  Check,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { ERC20_ABI } from "@/lib/erc20";

type Token = {
  symbol: string;
  name?: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  open: boolean;
  tokens: Token[];
  onClose: () => void;
  onSelect: (token: Token) => void;
};

function shortenAddress(address: string) {
  if (!address) return "";

  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function TokenSelector({
  open,
  tokens,
  onClose,
  onSelect,
}: Props) {
  const publicClient = usePublicClient();

  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [chainToken, setChainToken] = useState<Token | null>(null);
  const [searchingChain, setSearchingChain] = useState(false);
  const [chainError, setChainError] = useState("");

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tokens;
    }

    if (isAddress(query)) {
      return tokens.filter(
        (token) =>
          token.address.toLowerCase() === query
      );
    }

    return tokens.filter((token) => {
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query)
      );
    });
  }, [tokens, search]);

  async function searchChain(address: string) {
    if (!publicClient) {
      setChainError("Blockchain connection unavailable.");
      return;
    }

    if (!isAddress(address)) {
      return;
    }

    const alreadyListed = tokens.some(
      (token) =>
        token.address.toLowerCase() ===
        address.toLowerCase()
    );

    if (alreadyListed) {
      setChainToken(null);
      setChainError("");
      return;
    }

    setSearchingChain(true);
    setChainError("");
    setChainToken(null);

    try {
      const contractAddress = address as `0x${string}`;

      const [symbol, name, decimals] =
        await Promise.all([
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

      setChainToken({
        symbol: String(symbol),
        name: String(name),
        address: contractAddress,
        decimals: Number(decimals),
        native: false,
      });
    } catch (error) {
      console.error(
        "Unable to read token from IOPn chain:",
        error
      );

      setChainError(
        "No valid ERC-20 token found at this contract address."
      );
    } finally {
      setSearchingChain(false);
    }
  }

  useEffect(() => {
    const query = search.trim();

    if (!isAddress(query)) {
      setChainToken(null);
      setChainError("");
      return;
    }

    const timer = setTimeout(() => {
      searchChain(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  if (!open) {
    return null;
  }

  function closeSelector() {
    setSearch("");
    setCopied("");
    setChainToken(null);
    setChainError("");
    onClose();
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);

      setCopied(address);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  function selectToken(token: Token) {
    setSearch("");
    setChainToken(null);
    setChainError("");
    onSelect(token);
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        justify-center
        bg-black/60
        px-0
        backdrop-blur-md
        sm:items-center
        sm:px-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeSelector();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[88vh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-t-[2rem]
          border
          border-slate-200
          bg-white
          text-slate-950
          shadow-2xl
          sm:rounded-[2rem]
        "
      >

        {/* HEADER */}

        <div
          className="
            border-b
            border-slate-200
            p-5
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-black">
                Select Token
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Choose a token to swap
              </p>
            </div>

            <button
              type="button"
              onClick={closeSelector}
              aria-label="Close token selector"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-slate-50
                text-slate-500
                transition
                hover:border-cyan-400/30
                hover:bg-cyan-400/10
                hover:text-cyan-500
              "
            >
              <X size={19} />
            </button>

          </div>

          {/* SEARCH */}

          <div className="relative mt-5">

            <Search
              size={19}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              autoFocus
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const query = search.trim();

                  if (isAddress(query)) {
                    searchChain(query);
                  }
                }
              }}
              placeholder="Search token or contract"
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                py-4
                pl-12
                pr-14
                text-sm
                text-slate-900
                outline-none
                placeholder:text-slate-400
                transition
                focus:border-cyan-400/50
                focus:bg-white
              "
            />

            <button
              type="button"
              disabled={
                searchingChain ||
                !isAddress(search.trim())
              }
              onClick={() =>
                searchChain(search.trim())
              }
              className="
                absolute
                right-2
                top-1/2
                flex
                h-9
                w-9
                -translate-y-1/2
                items-center
                justify-center
                rounded-xl
                bg-cyan-400/10
                text-cyan-500
                transition
                hover:bg-cyan-400/20
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
              aria-label="Search contract on IOPn"
            >
              {searchingChain ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Search size={16} />
              )}
            </button>

          </div>

          {/* CHAIN STATUS */}

          {searchingChain && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                text-[11px]
                text-cyan-500
              "
            >
              <Loader2
                size={13}
                className="animate-spin"
              />

              Reading token data from IOPn...
            </div>
          )}

          {chainError && (
            <div
              className="
                mt-3
                flex
                items-start
                gap-2
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-3
                py-2.5
                text-[11px]
                text-red-600
              "
            >
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>{chainError}</span>
            </div>
          )}

        </div>

        {/* TOKEN LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">

          {/* FOUND TOKEN */}

          {chainToken && (
            <div className="mb-3">

              <p
                className="
                  mb-2
                  px-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-cyan-500/70
                "
              >
                Found on IOPn
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.05]
                  p-3
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-cyan-400/20
                    to-purple-500/20
                    text-lg
                    font-black
                    text-cyan-500
                    ring-1
                    ring-cyan-400/20
                  "
                >
                  {chainToken.symbol.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-2">

                    <span className="font-black">
                      {chainToken.symbol}
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-cyan-400/10
                        px-2
                        py-0.5
                        text-[10px]
                        font-bold
                        text-cyan-500
                      "
                    >
                      Found
                    </span>

                  </div>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >
                    {chainToken.name}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {shortenAddress(chainToken.address)}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    selectToken(chainToken)
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-xl
                    bg-cyan-400
                    px-3
                    py-2
                    text-[11px]
                    font-black
                    text-black
                    transition
                    hover:bg-cyan-300
                    hover:shadow-[0_0_18px_rgba(34,211,238,0.2)]
                    active:scale-95
                  "
                >
                  <Download size={13} />
                  Import
                </button>

              </div>

            </div>
          )}

          {/* NO RESULTS */}

          {filteredTokens.length === 0 &&
          !chainToken &&
          !searchingChain ? (

            <div className="px-5 py-12 text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-cyan-500/10
                  text-cyan-500
                "
              >
                <Search size={22} />
              </div>

              <h3 className="mt-4 font-bold">
                No token found
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Search by symbol or paste an IOPn
                contract address.
              </p>

            </div>

          ) : (

            <div className="space-y-2">

              {filteredTokens.map((token) => (

                <div
                  key={token.address}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-transparent
                    p-3
                    transition
                    hover:border-cyan-400/20
                    hover:bg-slate-50
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      selectToken(token)
                    }
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                      gap-3
                      text-left
                    "
                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-cyan-400/20
                        to-purple-500/20
                        text-lg
                        font-black
                        text-cyan-500
                        ring-1
                        ring-slate-200
                      "
                    >
                      {token.symbol.charAt(0)}
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <span className="font-black">
                          {token.symbol}
                        </span>

                        <span
                          className="
                            rounded-full
                            bg-emerald-400/10
                            px-2
                            py-0.5
                            text-[10px]
                            font-bold
                            text-emerald-600
                          "
                        >
                          Listed
                        </span>

                      </div>

                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          text-slate-500
                        "
                      >
                        {token.native
                          ? "Native OPN token"
                          : token.name ||
                            shortenAddress(
                              token.address
                            )}
                      </p>

                    </div>

                  </button>

                  {!token.native && (
                    <button
                      type="button"
                      onClick={() =>
                        copyAddress(token.address)
                      }
                      aria-label={`Copy ${token.symbol} address`}
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-400
                        transition
                        hover:bg-cyan-400/10
                        hover:text-cyan-500
                      "
                    >
                      {copied === token.address ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}

                  <ChevronRight
                    size={18}
                    className="
                      shrink-0
                      text-slate-300
                    "
                  />

                </div>

              ))}

            </div>

          )}

        </div>

        {/* FOOTER */}

        <div
          className="
            border-t
            border-slate-200
            px-5
            py-4
          "
        >
          <p
            className="
              text-center
              text-[11px]
              text-slate-400
            "
          >
            Always verify token contracts before swapping.
          </p>
        </div>

      </div>
    </div>
  );
}