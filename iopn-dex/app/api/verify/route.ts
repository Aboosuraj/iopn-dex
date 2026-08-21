import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  process.env.IOPN_EXPLORER_URL ||
  "https://testnet.iopn.tech";

/*
 * Optional override.
 *
 * If your explorer exposes an API through another URL,
 * set:
 *
 * IOPN_EXPLORER_API_URL=https://testnet.iopn.tech/api
 *
 * Otherwise we use the explorer itself.
 */
const EXPLORER_API_URL =
  process.env.IOPN_EXPLORER_API_URL ||
  EXPLORER_URL;

/*
 * Files are in:
 *
 * iopn-dex/artifacts/
 *
 * NOT:
 *
 * public/artifacts/
 */
const ARTIFACT_DIR = path.join(
  process.cwd(),
  "artifacts"
);

const ARTIFACT_FILE = path.join(
  ARTIFACT_DIR,
  "IOPnToken.json"
);

const STANDARD_INPUT_FILE = path.join(
  ARTIFACT_DIR,
  "IOPnToken-standard-input.json"
);

/*
 * Etherscan-compatible verification API.
 */
const VERIFY_ENDPOINT =
  `${EXPLORER_API_URL}/api`;

/*
 * How many times the server will check whether
 * the explorer has indexed the contract before
 * submitting verification.
 */
const CONTRACT_INDEX_ATTEMPTS = 20;

const CONTRACT_INDEX_DELAY = 2000;

/*
 * Verification status polling.
 *
 * 30 attempts × 4 seconds = approximately 2 minutes.
 */
const VERIFICATION_ATTEMPTS = 30;

const VERIFICATION_DELAY = 4000;

/* =========================================================
   TYPES
========================================================= */

type Artifact = {
  abi?: unknown;
  bytecode?: string;
  contractName?: string;
  compiler?: {
    version?: string;
    fullVersion?: string;
  };
  optimization?: {
    enabled?: boolean;
    runs?: number;
  };
};

type VerifyBody = {
  address?: string;
  contractName?: string;
  compilerVersion?: string;
  licenseType?: string;
  standardInput?: string;
  constructorArgs?: string;
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

function sleep(
  milliseconds: number
) {
  return new Promise<void>(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}

function isValidAddress(
  value: string
) {
  return /^0x[a-fA-F0-9]{40}$/.test(
    value
  );
}

function cleanHex(
  value: string | undefined
) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/^0x/i, "");
}

/*
 * Normalize strings returned by different explorer
 * versions.
 */
function normalizeText(
  value: unknown
) {
  if (
    typeof value ===
    "string"
  ) {
    return value
      .trim()
      .toLowerCase();
  }

  return "";
}

/*
 * Determine whether a response means that the
 * contract is already verified.
 */
function responseMeansVerified(
  payload: any
): boolean {
  if (!payload) {
    return false;
  }

  if (
    payload.verified === true ||
    payload.isVerified === true ||
    payload.isFullyVerified === true ||
    payload.sourceVerified === true ||
    payload.is_verified === true
  ) {
    return true;
  }

  const directFields = [
    payload.status,
    payload.message,
    payload.result,
    payload.data?.status,
    payload.data?.message,
    payload.data?.result,
  ];

  const text = directFields
    .map(normalizeText)
    .join(" ");

  if (
    text.includes(
      "already verified"
    ) ||
    text.includes(
      "contract source code already verified"
    ) ||
    text.includes(
      "source code verified"
    ) ||
    text.includes(
      "contract verified"
    ) ||
    text.includes(
      "verification successful"
    ) ||
    text.includes(
      "verification completed"
    ) ||
    text === "pass" ||
    text === "verified"
  ) {
    return true;
  }

  /*
   * Blockscout/Etherscan style getsourcecode
   * responses normally contain a non-empty SourceCode
   * when the contract is verified.
   */
  const result =
    Array.isArray(
      payload.result
    )
      ? payload.result[0]
      : Array.isArray(
          payload.data
        )
      ? payload.data[0]
      : payload.result;

  if (
    result &&
    typeof result ===
      "object"
  ) {
    const sourceCode =
      result.SourceCode ??
      result.sourceCode ??
      result.source_code;

    const abi =
      result.ABI ??
      result.abi;

    const contractName =
      result.ContractName ??
      result.contractName;

    if (
      typeof sourceCode ===
        "string" &&
      sourceCode.trim() &&
      sourceCode.trim() !==
        "Contract source code not verified"
    ) {
      return true;
    }

    if (
      typeof abi ===
        "string" &&
      abi.trim() &&
      abi.trim() !==
        "Contract source code not verified"
    ) {
      return true;
    }

    if (
      typeof contractName ===
        "string" &&
      contractName.trim() &&
      sourceCode
    ) {
      return true;
    }
  }

  return false;
}

/*
 * Extract the explorer's verification status.
 */
function extractVerificationStatus(
  payload: any
) {
  if (
    responseMeansVerified(
      payload
    )
  ) {
    return "verified" as const;
  }

  const values = [
    payload?.status,
    payload?.message,
    payload?.result,
    payload?.data?.status,
    payload?.data?.message,
    payload?.data?.result,
  ]
    .map(normalizeText)
    .join(" ");

  if (
    values.includes(
      "pending"
    ) ||
    values.includes(
      "submitted"
    ) ||
    values.includes(
      "queued"
    ) ||
    values.includes(
      "processing"
    ) ||
    values.includes(
      "in progress"
    ) ||
    values.includes(
      "under verification"
    ) ||
    values.includes(
      "verification submitted"
    )
  ) {
    return "pending" as const;
  }

  if (
    values.includes(
      "fail"
    ) ||
    values.includes(
      "error"
    ) ||
    values.includes(
      "invalid"
    ) ||
    values.includes(
      "not verified"
    )
  ) {
    return "error" as const;
  }

  return "unknown" as const;
}

/* =========================================================
   EXPLORER REQUEST
========================================================= */

async function explorerGet(
  params: Record<
    string,
    string
  >
) {
  const query =
    new URLSearchParams(
      params
    );

  const url =
    `${VERIFY_ENDPOINT}?${query.toString()}`;

  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  const text =
    await response.text();

  let data: any;

  try {
    data =
      JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  return {
    response,
    data,
  };
}

async function explorerPost(
  body: URLSearchParams
) {
  const response =
    await fetch(
      VERIFY_ENDPOINT,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
          Accept:
            "application/json",
        },
        body:
          body.toString(),
      }
    );

  const text =
    await response.text();

  let data: any;

  try {
    data =
      JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  return {
    response,
    data,
  };
}

/* =========================================================
   CHECK CONTRACT
========================================================= */

async function checkContract(
  address: string
) {
  /*
   * First try the Etherscan-compatible endpoint.
   */
  try {
    const {
      response,
      data,
    } =
      await explorerGet({
        module: "contract",
        action:
          "getsourcecode",
        address,
      });

    if (
      response.ok &&
      responseMeansVerified(
        data
      )
    ) {
      return {
        verified: true,
        indexed: true,
        data,
      };
    }

    /*
     * A valid getsourcecode response also tells us
     * that the explorer knows the address.
     */
    if (
      response.ok
    ) {
      const result =
        Array.isArray(
          data?.result
        )
          ? data.result[0]
          : undefined;

      if (
        result &&
        typeof result ===
          "object"
      ) {
        return {
          verified: false,
          indexed: true,
          data,
        };
      }
    }
  } catch {
    /*
     * Continue with the HTML/API fallback below.
     */
  }

  /*
   * Blockscout v2-style smart contract endpoint.
   */
  try {
    const response =
      await fetch(
        `${EXPLORER_API_URL}/api/v2/smart-contracts/${address}`,
        {
          cache: "no-store",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (
      response.ok
    ) {
      const data =
        await response.json();

      if (
        responseMeansVerified(
          data
        )
      ) {
        return {
          verified: true,
          indexed: true,
          data,
        };
      }

      return {
        verified: false,
        indexed: true,
        data,
      };
    }
  } catch {
    /*
     * Explorer may not expose v2.
     */
  }

  return {
    verified: false,
    indexed: false,
    data: null,
  };
}

/* =========================================================
   WAIT FOR INDEXING
========================================================= */

async function waitForContractIndexing(
  address: string
) {
  for (
    let attempt = 1;
    attempt <=
    CONTRACT_INDEX_ATTEMPTS;
    attempt++
  ) {
    const state =
      await checkContract(
        address
      );

    if (
      state.indexed
    ) {
      return state;
    }

    if (
      attempt <
      CONTRACT_INDEX_ATTEMPTS
    ) {
      await sleep(
        CONTRACT_INDEX_DELAY
      );
    }
  }

  return {
    verified: false,
    indexed: false,
    data: null,
  };
}

/* =========================================================
   SUBMIT VERIFICATION
========================================================= */

async function submitVerification(
  body: VerifyBody
) {
  const address =
    body.address!.trim();

  const contractName =
    (
      body.contractName ||
      "IOPnToken"
    ).trim();

  const compilerVersion =
    (
      body.compilerVersion ||
      "v0.8.36+commit.8a079791"
    ).trim();

  const licenseType =
    (
      body.licenseType ||
      "mit"
    ).trim();

  const standardInput =
    body.standardInput || "";

  const constructorArgs =
    cleanHex(
      body.constructorArgs
    );

  const optimizationEnabled =
    body.optimizationEnabled ??
    true;

  const optimizationRuns =
    body.optimizationRuns ??
    200;

  if (!standardInput) {
    throw new Error(
      "Standard JSON compiler input is missing."
    );
  }

  /*
   * IMPORTANT:
   *
   * Etherscan-compatible APIs expect:
   *
   * codeformat =
   * solidity-standard-json-input
   *
   * sourceCode =
   * complete Standard JSON input
   */
  const form =
    new URLSearchParams();

  form.set(
    "module",
    "contract"
  );

  form.set(
    "action",
    "verifysourcecode"
  );

  form.set(
    "contractaddress",
    address
  );

  form.set(
    "sourceCode",
    standardInput
  );

  form.set(
    "codeformat",
    "solidity-standard-json-input"
  );

  form.set(
    "contractname",
    contractName
  );

  form.set(
    "compilerversion",
    compilerVersion
  );

  form.set(
    "optimizationUsed",
    optimizationEnabled
      ? "1"
      : "0"
  );

  form.set(
    "runs",
    String(
      optimizationRuns
    )
  );

  form.set(
    "licenseType",
    licenseType
  );

  /*
   * The Etherscan-compatible parameter is historically
   * spelled constructorArguements.
   */
  form.set(
    "constructorArguements",
    constructorArgs
  );

  /*
   * Also send the correctly spelled variant because
   * some explorer implementations accept it.
   */
  form.set(
    "constructorArguments",
    constructorArgs
  );

  const {
    response,
    data,
  } =
    await explorerPost(
      form
    );

  /*
   * Some explorers return HTTP 200 even when verification
   * failed, so HTTP status alone is not enough.
   */
  const status =
    extractVerificationStatus(
      data
    );

  if (
    responseMeansVerified(
      data
    )
  ) {
    return {
      success: true,
      verified: true,
      submitted: true,
      data,
    };
  }

  if (
    status ===
    "error"
  ) {
    const message =
      data?.result ||
      data?.message ||
      data?.error ||
      "Explorer rejected the verification request.";

    throw new Error(
      String(message)
    );
  }

  /*
   * A verification GUID/hash is normally returned.
   */
  const verificationId =
    data?.result ??
    data?.guid ??
    data?.id ??
    data?.data?.guid ??
    data?.data?.id ??
    null;

  return {
    success:
      response.ok,
    verified: false,
    submitted:
      response.ok,
    verificationId,
    data,
  };
}

/* =========================================================
   VERIFY STATUS BY GUID
========================================================= */

async function checkVerificationGuid(
  guid: string
) {
  try {
    const {
      response,
      data,
    } =
      await explorerGet({
        module: "contract",
        action:
          "checkverifystatus",
        guid,
      });

    if (
      responseMeansVerified(
        data
      )
    ) {
      return {
        verified: true,
        pending: false,
        data,
      };
    }

    const status =
      extractVerificationStatus(
        data
      );

    if (
      status ===
      "pending"
    ) {
      return {
        verified: false,
        pending: true,
        data,
      };
    }

    if (
      status ===
      "error"
    ) {
      return {
        verified: false,
        pending: false,
        error: true,
        data,
      };
    }
  } catch {
    /*
     * Status endpoint may not exist.
     */
  }

  return {
    verified: false,
    pending: false,
    data: null,
  };
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  const { searchParams } =
    new URL(
      request.url
    );

  /*
   * Artifact endpoint.
   *
   * This allows the browser to load the artifact from:
   *
   * artifacts/IOPnToken.json
   *
   * without requiring the artifact to be inside
   * public/.
   */
  if (
    searchParams.get(
      "artifact"
    ) === "true"
  ) {
    try {
      const raw =
        await fs.readFile(
          ARTIFACT_FILE,
          "utf8"
        );

      const artifact =
        JSON.parse(raw) as Artifact;

      return json({
        success: true,
        artifact,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load IOPnToken artifact.",
        },
        500
      );
    }
  }

  /*
   * Optional standard-input endpoint.
   */
  if (
    searchParams.get(
      "standardInput"
    ) === "true"
  ) {
    try {
      const standardInput =
        await fs.readFile(
          STANDARD_INPUT_FILE,
          "utf8"
        );

      return json({
        success: true,
        standardInput,
      });
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load Standard JSON input.",
        },
        500
      );
    }
  }

  /*
   * Verification status.
   */
  const address =
    searchParams.get(
      "address"
    );

  if (!address) {
    return json(
      {
        success: false,
        error:
          "Contract address is required.",
      },
      400
    );
  }

  if (
    !isValidAddress(
      address
    )
  ) {
    return json(
      {
        success: false,
        error:
          "Invalid contract address.",
      },
      400
    );
  }

  const state =
    await checkContract(
      address
    );

  return json({
    success: true,
    address,
    verified:
      state.verified,
    indexed:
      state.indexed,
    explorerUrl:
      `${EXPLORER_URL}/address/${address}?tab=contract`,
  });
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as VerifyBody;

    const address =
      body.address?.trim();

    if (
      !address ||
      !isValidAddress(
        address
      )
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

    /*
     * -------------------------------------------------------
     * 1. Check if it is ALREADY verified.
     * -------------------------------------------------------
     *
     * This is important when the user manually verified
     * the contract before returning to the app.
     */
    const before =
      await checkContract(
        address
      );

    if (
      before.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified:
          true,
        submitted: false,
        message:
          "Contract is already verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * 2. Wait for explorer indexing.
     * -------------------------------------------------------
     */
    const indexed =
      before.indexed
        ? before
        : await waitForContractIndexing(
            address
          );

    /*
     * It is okay if indexing is slow.
     *
     * We do not want to wait forever on the server.
     * The frontend can retry with GET.
     */
    if (
      !indexed.indexed
    ) {
      return json({
        success: true,
        verified: false,
        submitted: false,
        waitingForIndexing:
          true,
        message:
          "The explorer has not indexed the contract yet. Please check again shortly.",
      });
    }

    /*
     * -------------------------------------------------------
     * 3. Submit verification.
     * -------------------------------------------------------
     */
    const submission =
      await submitVerification(
        body
      );

    /*
     * -------------------------------------------------------
     * 4. Immediately check again.
     * -------------------------------------------------------
     *
     * This catches the case where the explorer says
     * "already verified" immediately after submission.
     */
    const after =
      await checkContract(
        address
      );

    if (
      after.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified:
          true,
        submitted:
          submission.submitted,
        verificationId:
          submission.verificationId ??
          null,
      });
    }

    return json({
      success:
        submission.success,
      verified: false,
      submitted:
        submission.submitted,
      waitingForIndexing:
        false,
      verificationId:
        submission.verificationId ??
        null,
      message:
        "Verification submitted. The explorer is processing the contract.",
    });
  } catch (error) {
    console.error(
      "Verification API error:",
      error
    );

    return json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Contract verification failed.",
      },
      500
    );
  }
}