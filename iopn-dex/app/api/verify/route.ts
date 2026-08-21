import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  encodeAbiParameters,
  isAddress,
  type Address,
} from "viem";

import {
  readFile,
} from "node:fs/promises";

import path from "node:path";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  (
    process.env.IOPN_EXPLORER_URL ||
    process.env.NEXT_PUBLIC_EXPLORER_URL ||
    "https://testnet.iopn.tech"
  ).replace(/\/+$/, "");

const DEFAULT_COMPILER_VERSION =
  "v0.8.36+commit.8a079791";

const DEFAULT_CONTRACT_NAME =
  "IOPnToken";

const DEFAULT_LICENSE =
  "mit";

const DEFAULT_OPTIMIZATION_ENABLED =
  true;

const DEFAULT_OPTIMIZATION_RUNS =
  200;

/*
 * How long this API route waits for the explorer
 * to recognize a freshly deployed contract.
 *
 * IMPORTANT:
 * We intentionally keep this short.
 * The frontend can continue checking afterward.
 */
const INDEXING_POLL_INTERVAL =
  2000;

const INDEXING_MAX_ATTEMPTS =
  15;

/* =========================================================
   TYPES
========================================================= */

type ConstructorArgsTuple = readonly [
  string,
  string,
  bigint,
  number,
  Address
];

type VerifyRequestBody = {
  address?: string;

  contractName?: string;

  compilerVersion?: string;

  licenseType?: string;

  standardInput?: string;

  constructorArgs?:
    | string
    | unknown[];

  autodetectConstructorArgs?: boolean;

  optimizationEnabled?: boolean;

  optimizationRuns?: number;
};

/* =========================================================
   HELPERS
========================================================= */

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    }
  );
}

/* =========================================================
   EXPLORER REQUEST
========================================================= */

async function explorerFetch(
  url: string,
  options: RequestInit = {}
) {
  return fetch(
    url,
    {
      ...options,

      headers: {
        Accept:
          "application/json",
        ...(options.headers || {}),
      },

      cache: "no-store",
    }
  );
}

/* =========================================================
   CONTRACT STATUS
========================================================= */

async function getContractStatus(
  address: Address
) {
  const url =
    `${EXPLORER_URL}/api/v2/smart-contracts/${address}`;

  try {
    const response =
      await explorerFetch(url);

    if (!response.ok) {
      return {
        available: false,
        verified: false,
        statusCode:
          response.status,
        data: null,
      };
    }

    const data =
      await response.json();

    const verified =
      data?.is_verified === true ||
      data?.isVerified === true ||
      data?.is_fully_verified === true ||
      data?.isFullyVerified === true;

    return {
      available: true,
      verified,
      statusCode:
        response.status,
      data,
    };
  } catch (error) {
    console.warn(
      "Explorer contract status request failed:",
      error
    );

    return {
      available: false,
      verified: false,
      statusCode: 0,
      data: null,
    };
  }
}

/* =========================================================
   WAIT FOR CONTRACT INDEXING
========================================================= */

async function waitForContractIndexing(
  address: Address
) {
  for (
    let attempt = 1;
    attempt <= INDEXING_MAX_ATTEMPTS;
    attempt++
  ) {
    const result =
      await getContractStatus(
        address
      );

    /*
     * If the explorer can already return the
     * contract, indexing has completed.
     */
    if (result.available) {
      return result;
    }

    if (
      attempt <
      INDEXING_MAX_ATTEMPTS
    ) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            INDEXING_POLL_INTERVAL
          )
      );
    }
  }

  return {
    available: false,
    verified: false,
    statusCode: 0,
    data: null,
  };
}

/* =========================================================
   LOAD STANDARD JSON INPUT
========================================================= */

async function loadStandardInput() {
  /*
   * Your files are in:
   *
   * iopn-dex/artifacts/
   *
   * NOT:
   *
   * public/artifacts/
   *
   * Therefore the API route reads them directly
   * from the server filesystem.
   */

  const filePath =
    path.join(
      process.cwd(),
      "artifacts",
      "IOPnToken-standard-input.json"
    );

  try {
    return await readFile(
      filePath,
      "utf8"
    );
  } catch (error) {
    console.error(
      "Unable to read standard input:",
      error
    );

    throw new Error(
      "IOPnToken-standard-input.json could not be found in the artifacts directory."
    );
  }
}

/* =========================================================
   NORMALIZE CONSTRUCTOR ARGUMENTS
========================================================= */

function normalizeConstructorArgs(
  value:
    | string
    | unknown[]
    | undefined
): string | null {
  /*
   * Your current deploy page already sends:
   *
   * encodedConstructorArgs
   *
   * as a raw hexadecimal string without 0x.
   *
   * Use it directly.
   */

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .trim()
        .replace(/^0x/i, "")
        .replace(/\s+/g, "");

    if (!cleaned) {
      return null;
    }

    if (
      !/^[0-9a-fA-F]+$/.test(
        cleaned
      )
    ) {
      throw new Error(
        "Constructor arguments must contain hexadecimal data."
      );
    }

    /*
     * ABI encoded data must have an even number
     * of hexadecimal characters.
     */
    if (
      cleaned.length % 2 !==
      0
    ) {
      throw new Error(
        "Constructor argument encoding has an invalid hexadecimal length."
      );
    }

    return cleaned;
  }

  /*
   * Compatibility:
   *
   * If a future frontend sends the actual constructor
   * values instead of an encoded string, support that too.
   */

  if (
    Array.isArray(value)
  ) {
    if (
      value.length !== 5
    ) {
      throw new Error(
        "IOPnToken constructor requires exactly 5 arguments."
      );
    }

    const name =
      String(value[0]);

    const symbol =
      String(value[1]);

    let supply: bigint;

    if (
      typeof value[2] ===
      "bigint"
    ) {
      supply = value[2];
    } else if (
      typeof value[2] ===
        "string" &&
      /^[0-9]+$/.test(
        value[2]
      )
    ) {
      supply =
        BigInt(value[2]);
    } else if (
      typeof value[2] ===
      "number"
    ) {
      supply =
        BigInt(value[2]);
    } else {
      throw new Error(
        "Invalid uint256 constructor argument."
      );
    }

    const decimals =
      Number(value[3]);

    const owner =
      String(value[4]);

    if (
      !Number.isInteger(
        decimals
      ) ||
      decimals < 0 ||
      decimals > 18
    ) {
      throw new Error(
        "Invalid token decimals."
      );
    }

    if (
      !isAddress(owner)
    ) {
      throw new Error(
        "Invalid token owner address."
      );
    }

    /*
     * THIS IS THE IMPORTANT TYPE FIX.
     *
     * The tuple is explicitly typed as exactly:
     *
     * [string, string, bigint, number, Address]
     *
     * Therefore TypeScript will not infer any[].
     */
    const tuple =
      [
        name,
        symbol,
        supply,
        decimals,
        owner as Address,
      ] as const satisfies ConstructorArgsTuple;

    const encoded =
      encodeAbiParameters(
        [
          {
            type: "string",
          },
          {
            type: "string",
          },
          {
            type: "uint256",
          },
          {
            type: "uint8",
          },
          {
            type: "address",
          },
        ],
        tuple
      );

    return encoded.replace(
      /^0x/,
      ""
    );
  }

  return null;
}

/* =========================================================
   VERIFICATION RESPONSE PARSER
========================================================= */

async function parseExplorerResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text) {
    return {
      data: null,
      raw: "",
    };
  }

  try {
    return {
      data:
        JSON.parse(text),
      raw: text,
    };
  } catch {
    return {
      data: null,
      raw: text,
    };
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    let body:
      VerifyRequestBody;

    try {
      body =
        (await request.json()) as VerifyRequestBody;
    } catch {
      return json(
        {
          success: false,
          error:
            "Invalid JSON request body.",
        },
        400
      );
    }

    /* =====================================================
       ADDRESS
    ===================================================== */

    const rawAddress =
      body.address?.trim();

    if (
      !rawAddress ||
      !isAddress(rawAddress)
    ) {
      return json(
        {
          success: false,
          error:
            "A valid contract address is required.",
        },
        400
      );
    }

    const contractAddress =
      rawAddress as Address;

    /* =====================================================
       ALREADY VERIFIED CHECK
    ===================================================== */

    const existing =
      await getContractStatus(
        contractAddress
      );

    if (
      existing.verified
    ) {
      return json(
        {
          success: true,
          verified: true,
          isVerified: true,
          isFullyVerified: true,
          message:
            "Contract is already verified.",
          explorerUrl:
            `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,
        },
        200
      );
    }

    /* =====================================================
       STANDARD INPUT
    ===================================================== */

    const standardInput =
      body.standardInput?.trim() ||
      (await loadStandardInput());

    if (!standardInput) {
      return json(
        {
          success: false,
          error:
            "Standard JSON compiler input is empty.",
        },
        400
      );
    }

    /*
     * Validate that it is actually JSON.
     */
    try {
      JSON.parse(
        standardInput
      );
    } catch {
      return json(
        {
          success: false,
          error:
            "IOPnToken-standard-input.json contains invalid JSON.",
        },
        400
      );
    }

    /* =====================================================
       CONSTRUCTOR ARGUMENTS
    ===================================================== */

    const constructorArgs =
      normalizeConstructorArgs(
        body.constructorArgs
      );

    /*
     * If constructor arguments are unavailable,
     * allow Blockscout to autodetect them.
     *
     * Your current frontend sends the exact encoded
     * arguments, so this normally won't be used.
     */
    const autodetect =
      constructorArgs
        ? false
        : body.autodetectConstructorArgs ??
          true;

    /* =====================================================
       COMPILER
    ===================================================== */

    const compilerVersion =
      body.compilerVersion?.trim() ||
      DEFAULT_COMPILER_VERSION;

    const contractName =
      body.contractName?.trim() ||
      DEFAULT_CONTRACT_NAME;

    const licenseType =
      body.licenseType?.trim() ||
      DEFAULT_LICENSE;

    const optimizationEnabled =
      body.optimizationEnabled ??
      DEFAULT_OPTIMIZATION_ENABLED;

    const optimizationRuns =
      Number.isInteger(
        body.optimizationRuns
      )
        ? body.optimizationRuns!
        : DEFAULT_OPTIMIZATION_RUNS;

    /* =====================================================
       WAIT FOR EXPLORER INDEXING
    ===================================================== */

    const indexed =
      await waitForContractIndexing(
        contractAddress
      );

    /*
     * If the explorer still does not know about the
     * contract, DON'T keep the server request alive
     * for minutes.
     *
     * Return a successful "pending" response.
     *
     * The frontend will continue polling through:
     *
     * GET /api/verify?address=...
     */

    if (
      !indexed.available
    ) {
      return json(
        {
          success: true,
          submitted: false,
          verified: false,
          pending: true,
          waitingForIndexer: true,
          message:
            "The deployment is confirmed, but the IOPn Explorer has not indexed the contract yet. Verification will be retried when the explorer becomes ready.",
          address:
            contractAddress,
          explorerUrl:
            `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,
        },
        202
      );
    }

    /*
     * It became indexed between the initial check
     * and now.
     */
    if (
      indexed.verified
    ) {
      return json(
        {
          success: true,
          verified: true,
          isVerified: true,
          isFullyVerified: true,
          message:
            "Contract is already verified.",
          explorerUrl:
            `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,
        },
        200
      );
    }

    /* =====================================================
       BLOCKSCOUT STANDARD JSON ENDPOINT
    ===================================================== */

    const verificationUrl =
      `${EXPLORER_URL}/api/v2/smart-contracts/${contractAddress}/verification/via/standard-input`;

    /*
     * Blockscout's Standard JSON verification endpoint
     * expects multipart/form-data, not JSON.
     */
    const form =
      new FormData();

    /*
     * Standard JSON source input.
     *
     * The field name is files[0].
     */
    const sourceBlob =
      new Blob(
        [
          standardInput,
        ],
        {
          type:
            "application/json",
        }
      );

    form.append(
      "files[0]",
      sourceBlob,
      "IOPnToken-standard-input.json"
    );

    form.append(
      "compiler_version",
      compilerVersion
    );

    form.append(
      "contract_name",
      contractName
    );

    form.append(
      "license_type",
      licenseType
    );

    form.append(
      "autodetect_constructor_args",
      autodetect
        ? "true"
        : "false"
    );

    /*
     * Only include constructor_args when we have
     * exact encoded constructor arguments.
     */
    if (
      constructorArgs
    ) {
      form.append(
        "constructor_args",
        constructorArgs
      );
    }

    /* =====================================================
       SUBMIT VERIFICATION
    ===================================================== */

    let verificationResponse:
      Response;

    try {
      verificationResponse =
        await fetch(
          verificationUrl,
          {
            method: "POST",
            body: form,
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );
    } catch (error) {
      console.error(
        "Explorer verification request failed:",
        error
      );

      return json(
        {
          success: false,
          verified: false,
          error:
            "Could not connect to the IOPn Explorer verification service.",
          details:
            error instanceof Error
              ? error.message
              : String(error),
        },
        502
      );
    }

    /* =====================================================
       PARSE RESPONSE
    ===================================================== */

    const explorerResult =
      await parseExplorerResponse(
        verificationResponse
      );

    console.log(
      "IOPn verification response:",
      {
        status:
          verificationResponse.status,
        ok:
          verificationResponse.ok,
        data:
          explorerResult.data,
        raw:
          explorerResult.raw,
      }
    );

    /* =====================================================
       SUCCESS
    ===================================================== */

    if (
      verificationResponse.ok
    ) {
      /*
       * Some Blockscout versions return an empty 200/201
       * response when the request is accepted.
       *
       * Therefore HTTP success itself means the request
       * was accepted; actual verification is checked later
       * through GET /api/verify.
       */

      return json(
        {
          success: true,
          submitted: true,
          verified: false,
          pending: true,

          message:
            "Contract verification was submitted successfully. The explorer is processing the source code.",

          address:
            contractAddress,

          explorerUrl:
            `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,

          verificationResponse:
            explorerResult.data,

          rawResponse:
            explorerResult.raw || undefined,
        },
        200
      );
    }

    /* =====================================================
       EXPLORER REJECTED REQUEST
    ===================================================== */

    const explorerMessage =
      explorerResult.data?.message ||
      explorerResult.data?.error ||
      explorerResult.data?.detail ||
      explorerResult.data?.result ||
      explorerResult.raw ||
      `Explorer returned HTTP ${verificationResponse.status}.`;

    return json(
      {
        success: false,
        submitted: false,
        verified: false,

        error:
          typeof explorerMessage ===
          "string"
            ? explorerMessage
            : "The IOPn Explorer rejected the verification request.",

        explorerStatus:
          verificationResponse.status,

        explorerResponse:
          explorerResult.data,

        address:
          contractAddress,

        explorerUrl:
          `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,
      },
      verificationResponse.status >=
        400 &&
        verificationResponse.status <
          500
        ? 400
        : 502
    );
  } catch (error) {
    console.error(
      "POST /api/verify failed:",
      error
    );

    return json(
      {
        success: false,
        verified: false,

        error:
          error instanceof Error
            ? error.message
            : "Automatic contract verification failed.",

        details:
          error instanceof Error
            ? error.stack
            : undefined,
      },
      500
    );
  }
}

/* =========================================================
   GET
   GET /api/verify?address=0x...
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const address =
      request.nextUrl.searchParams.get(
        "address"
      );

    if (
      !address ||
      !isAddress(address)
    ) {
      return json(
        {
          success: false,
          verified: false,
          error:
            "A valid contract address is required.",
        },
        400
      );
    }

    const contractAddress =
      address as Address;

    const result =
      await getContractStatus(
        contractAddress
      );

    /*
     * Explorer has not indexed the contract yet.
     */
    if (
      !result.available
    ) {
      return json(
        {
          success: true,
          verified: false,
          isVerified: false,
          isFullyVerified: false,

          pending: true,
          waitingForIndexer: true,

          address:
            contractAddress,

          message:
            "Contract has not been indexed by the explorer yet.",

          explorerUrl:
            `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,
        },
        200
      );
    }

    /*
     * Actual explorer verification state.
     */
    const data =
      result.data || {};

    const isVerified =
      data?.is_verified === true ||
      data?.isVerified === true;

    const isFullyVerified =
      data?.is_fully_verified === true ||
      data?.isFullyVerified === true;

    const isPartiallyVerified =
      data?.is_partially_verified === true ||
      data?.isPartiallyVerified === true;

    return json(
      {
        success: true,

        verified:
          isVerified ||
          isFullyVerified,

        isVerified,

        isFullyVerified,

        isPartiallyVerified,

        pending:
          !(
            isVerified ||
            isFullyVerified
          ),

        waitingForIndexer:
          false,

        address:
          contractAddress,

        contractName:
          data?.name ||
          data?.contract_name ||
          DEFAULT_CONTRACT_NAME,

        compilerVersion:
          data?.compiler_version ||
          undefined,

        optimizationEnabled:
          data?.optimization_enabled ??
          undefined,

        optimizationRuns:
          data?.optimization_runs ??
          data?.optimizations_runs ??
          undefined,

        verifiedAt:
          data?.verified_at ||
          undefined,

        explorerUrl:
          `${EXPLORER_URL}/address/${contractAddress}?tab=contract`,

        explorer:
          data,
      },
      200
    );
  } catch (error) {
    console.error(
      "GET /api/verify failed:",
      error
    );

    return json(
      {
        success: false,
        verified: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to check contract verification status.",
      },
      500
    );
  }
}