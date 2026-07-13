"use client";

import { useBalance } from "wagmi";
import { formatUnits } from "viem";

type Props = {
  token?: `0x${string}`;
  owner?: `0x${string}`;
  native?: boolean;
  decimals?: number;
};

export function useTokenBalance({
  token,
  owner,
  native,
}: Props) {

  const { data, isLoading } = useBalance({
    address: owner,
    token: native ? undefined : token,
    query: {
      enabled: !!owner,
    },
  });

  return {
    balance: data
      ? Number(
          formatUnits(
            data.value,
            data.decimals
          )
        ).toFixed(4)
      : "0.0000",

    symbol: data?.symbol ?? "",

    loading: isLoading,
  };
}