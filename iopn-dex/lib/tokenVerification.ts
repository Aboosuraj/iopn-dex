import { encodeAbiParameters, parseAbiParameters } from "viem";

export const EXPLORER_URL = "https://testnet.iopn.tech";

export const TOKEN_SOURCE_NAME = "IOPnToken.sol";

/**
 * Compilation settings used by the token compiler.
 *
 * Keep these values synchronized with scripts/compile-token.mjs.
 */
export const TOKEN_COMPILER_SETTINGS = {
  language: "Solidity",
  compilerVersion: "0.8.20",
  optimizer: {
    enabled: true,
    runs: 200,
  },
  evmVersion: "paris",
} as const;

export type TokenVerificationData = {
  address: `0x${string}`;
  transactionHash?: `0x${string}`;

  name: string;
  symbol: string;
  initialSupply: string;
  decimals: number;
  owner: `0x${string}`;

  sourceCode: string;
  compilerVersion: string;
  optimizationEnabled: boolean;
  optimizationRuns: number;
  evmVersion: string;

  constructorArguments: `0x${string}`;

  abi: unknown;
  bytecode: `0x${string}`;
};

export function encodeTokenConstructorArguments(params: {
  name: string;
  symbol: string;
  initialSupply: bigint;
  decimals: number;
  owner: `0x${string}`;
}) {
  return encodeAbiParameters(
    parseAbiParameters(
      "string,string,uint256,uint8,address"
    ),
    [
      params.name,
      params.symbol,
      params.initialSupply,
      params.decimals,
      params.owner,
    ]
  );
}

export function getExplorerAddressUrl(
  address: string
) {
  return `${EXPLORER_URL}/address/${address}`;
}

export function getExplorerTransactionUrl(
  hash: string
) {
  return `${EXPLORER_URL}/tx/${hash}`;
}