export const EXPLORER_URL =
  "https://testnet.iopn.tech";

export const EXPLORER_API_URL =
  `${EXPLORER_URL}/api/v2`;

export const CHAIN_ID = 984;

export const TOKEN_CONTRACT_NAME =
  "IOPnToken";

export const TOKEN_SOURCE_NAME =
  "IOPnToken.sol";

export const TOKEN_STANDARD_INPUT =
  "/artifacts/IOPnToken-standard-input.json";

export const TOKEN_ARTIFACT =
  "/artifacts/IOPnToken.json";

export const TOKEN_VERIFICATION_METADATA =
  "/artifacts/IOPnToken-verification.json";

export const VERIFICATION_API =
  "/api/verify";

export function getExplorerAddressUrl(
  address: string
) {
  return `${EXPLORER_URL}/address/${address}`;
}

export function getExplorerContractUrl(
  address: string
) {
  return `${EXPLORER_URL}/address/${address}?tab=contract`;
}

export function getExplorerTxUrl(
  txHash: string
) {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function isValidAddress(
  address: string | undefined | null
): address is `0x${string}` {
  return (
    typeof address === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(
      address
    )
  );
}