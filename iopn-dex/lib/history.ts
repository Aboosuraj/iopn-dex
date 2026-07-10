export type SwapHistoryItem = {
  hash: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  timestamp: number;
};

const STORAGE_KEY = "iopn_swap_history";

export function saveSwap(item: SwapHistoryItem) {
  if (typeof window === "undefined") return;

  const current = getSwapHistory();

  current.unshift(item);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(current)
  );
}

export function getSwapHistory(): SwapHistoryItem[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearSwapHistory() {
  localStorage.removeItem(STORAGE_KEY);
}