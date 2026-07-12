export function applySlippage(
  amount: bigint,
  slippage = 0.5
): bigint {
  const bps = BigInt(Math.floor(slippage * 100));
  return amount - (amount * bps) / 10000n;
}