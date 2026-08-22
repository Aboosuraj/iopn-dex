export const ROUTER_ADDRESS =
  "0xB489bce5c9c9364da2D1D1Bc5CE4274F63141885" as `0x${string}`;

export const FACTORY_ADDRESS =
  "0x8860242B65611dfd077aEe26C3C7920813dF9208" as `0x${string}`;

export const WOPN_ADDRESS =
  "0xBc022C9dEb5AF250A526321d16Ef52E39b4DBD84" as `0x${string}`;

export const OPN_ADDRESS =
  "0xA463ce9F738E0B4035D8d036B902D0efADb24d20" as `0x${string}`;

/*
 * Automatic token-launch liquidity
 *
 * 20% of the newly deployed token supply
 * is placed into the initial OPN liquidity pool.
 */
export const INITIAL_LIQUIDITY_PERCENT = 20n;

/*
 * Default OPN contribution to the initial pool.
 *
 * Change this value later if you want a different
 * initial OPN amount.
 */
export const INITIAL_LIQUIDITY_OPN = 1n;