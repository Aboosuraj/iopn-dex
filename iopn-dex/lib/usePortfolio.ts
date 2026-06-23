"use client";

import { useAccount, useBalance } from "wagmi";

export function usePortfolio() {
  const { address } = useAccount();

    const nativeBalance = useBalance({
        address,
          });

            return {
                address,
                    nativeBalance,
                      };
                      }