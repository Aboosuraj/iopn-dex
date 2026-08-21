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
 * IMPORTANT:
 *
 * IOPn Explorer exposes its Etherscan/Blockscout-compatible
 * verification API under:
 *
 * https://testnet.iopn.tech/api
 *
 * Do NOT append /api twice.
 */
const EXPLORER_API_URL =
  process.env.IOPN_EXPLORER_API_URL ||
  `${EXPLORER_URL}/api`;

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

const CONTRACT_INDEX_ATTEMPTS = 20;
const CONTRACT_INDEX_DELAY = 3000;

const VERIFICATION_ATTEMPTS = 30;
const VERIFICATION_DELAY = 5000;

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
   RESPONSE
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
   HELPERS
========================================================= */

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
  value?: string
) {
  return (
    value || ""
  )
    .trim()
    .replace(/^0x/i, "");
}

/* =========================================================
   EXPLORER API
========================================================= */

async function explorerGet(
  params: Record<string, string>
) {
  const query =
    new URLSearchParams(
      params
    );

  const url =
    `${EXPLORER_API_URL}?${query.toString()}`;

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
      EXPLORER_API_URL,
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
   STRICT VERIFICATION DETECTION
========================================================= */

/*
 * IMPORTANT:
 *
 * We intentionally DO NOT consider:
 *
 * - HTTP 200
 * - "OK"
 * - submission GUID
 * - "verification submitted"
 * - "pending"
 *
 * as proof that a contract is verified.
 *
 * ONLY getsourcecode with actual source code/ABI
 * is considered authoritative.
 */

function isActuallyVerified(
  payload: any
): boolean {
  if (!payload) {
    return false;
  }

  /*
   * Etherscan / Blockscout:
   *
   * {
   *   status: "1",
   *   message: "OK",
   *   result: [
   *     {
   *       SourceCode: "...",
   *       ABI: "...",
   *       ContractName: "IOPnToken"
   *     }
   *   ]
   * }
   */

  let result: any = null;

  if (
    Array.isArray(
      payload.result
    )
  ) {
    result =
      payload.result[0] ??
      null;
  } else if (
    payload.result &&
    typeof payload.result ===
      "object"
  ) {
    result =
      payload.result;
  } else if (
    Array.isArray(
      payload.data
    )
  ) {
    result =
      payload.data[0] ??
      null;
  } else if (
    payload.data &&
    typeof payload.data ===
      "object"
  ) {
    result =
      payload.data;
  }

  if (
    !result ||
    typeof result !== "object"
  ) {
    return false;
  }

  const sourceCode =
    result.SourceCode ??
    result.sourceCode ??
    result.source_code;

  const abi =
    result.ABI ??
    result.abi;

  /*
   * Explorer returns this exact message when
   * source code is NOT verified.
   */
  if (
    typeof sourceCode ===
      "string" &&
    sourceCode.trim() &&
    !sourceCode
      .toLowerCase()
      .includes(
        "contract source code not verified"
      )
  ) {
    /*
     * A real ABI should also exist.
     *
     * We require both source and ABI to avoid
     * false positives.
     */
    if (
      typeof abi ===
        "string" &&
      abi.trim() &&
      !abi
        .toLowerCase()
        .includes(
          "contract source code not verified"
        )
    ) {
      return true;
    }
  }

  return false;
}

/* =========================================================
   VERIFICATION STATUS TEXT
========================================================= */

function getStatusText(
  payload: any
) {
  const values = [
    payload?.status,
    payload?.message,
    payload?.result,
    payload?.data?.status,
    payload?.data?.message,
    payload?.data?.result,
  ];

  return values
    .map((value) => {
      if (
        typeof value ===
        "string"
      ) {
        return value
          .trim()
          .toLowerCase();
      }

      return "";
    })
    .join(" ");
}

/* =========================================================
   CHECK SOURCE CODE
========================================================= */

async function checkExplorerSource(
  address: string
) {
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

  /*
   * NEVER trust status/message alone.
   */
  const verified =
    response.ok &&
    isActuallyVerified(
      data
    );

  /*
   * Determine whether explorer knows the address.
   */
  let indexed = false;

  if (
    response.ok &&
    Array.isArray(
      data?.result
    ) &&
    data.result.length > 0
  ) {
    indexed = true;
  }

  return {
    verified,
    indexed,
    data,
  };
}

/* =========================================================
   BLOCKSCOUT V2 FALLBACK
========================================================= */

async function checkBlockscoutContract(
  address: string
) {
  try {
    /*
     * IMPORTANT:
     *
     * EXPLORER_API_URL already contains /api.
     *
     * Remove it before constructing /api/v2.
     */
    const base =
      EXPLORER_URL.replace(
        /\/$/,
        ""
      );

    const url =
      `${base}/api/v2/smart-contracts/${address}`;

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

    if (!response.ok) {
      return {
        verified: false,
        indexed: false,
        data: null,
      };
    }

    const data =
      await response.json();

    /*
     * Blockscout v2 commonly exposes:
     *
     * is_verified: true
     */
    if (
      data?.is_verified === true ||
      data?.isVerified === true
    ) {
      return {
        verified: true,
        indexed: true,
        data,
      };
    }

    /*
     * Some installations expose source_code.
     */
    const sourceCode =
      data?.source_code ??
      data?.sourceCode;

    const abi =
      data?.abi ??
      data?.ABI;

    if (
      typeof sourceCode ===
        "string" &&
      sourceCode.trim() &&
      typeof abi ===
        "string" &&
      abi.trim()
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
  } catch {
    return {
      verified: false,
      indexed: false,
      data: null,
    };
  }
}

/* =========================================================
   AUTHORITATIVE CONTRACT CHECK
========================================================= */

async function checkContract(
  address: string
) {
  /*
   * FIRST:
   *
   * Etherscan-compatible getsourcecode.
   */
  try {
    const state =
      await checkExplorerSource(
        address
      );

    if (
      state.verified
    ) {
      return state;
    }

    if (
      state.indexed
    ) {
      return state;
    }
  } catch {
    /*
     * Continue.
     */
  }

  /*
   * SECOND:
   *
   * Blockscout v2.
   */
  const blockscout =
    await checkBlockscoutContract(
      address
    );

  if (
    blockscout.verified
  ) {
    return blockscout;
  }

  if (
    blockscout.indexed
  ) {
    return blockscout;
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

async function waitForIndexing(
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
      state.verified
    ) {
      return state;
    }

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
    body.standardInput ||
    "";

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
   * Blockscout/Etherscan compatible
   * Standard JSON verification.
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
   * Etherscan historically uses this misspelling.
   */
  form.set(
    "constructorArguements",
    constructorArgs
  );

  /*
   * Some implementations use the correct spelling.
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

  if (
    !response.ok
  ) {
    throw new Error(
      `Explorer returned HTTP ${response.status}.`
    );
  }

  /*
   * IMPORTANT:
   *
   * Do not treat "OK" as verification.
   */
  const result =
    data?.result;

  const message =
    data?.message;

  /*
   * Explicit rejection.
   */
  if (
    data?.status === "0"
  ) {
    const text =
      `${message || ""} ${result || ""}`
        .toLowerCase();

    /*
     * Some Blockscout installations can return
     * "OK" with a verification GUID in result.
     *
     * Therefore only reject if it clearly contains
     * an actual error.
     */
    if (
      text.includes(
        "error"
      ) ||
      text.includes(
        "fail"
      ) ||
      text.includes(
        "invalid"
      ) ||
      text.includes(
        "not verified"
      ) ||
      text.includes(
        "unable"
      ) ||
      text.includes(
        "does not match"
      )
    ) {
      throw new Error(
        String(
          result ||
            message ||
            "Explorer rejected verification."
        )
      );
    }
  }

  const verificationId =
    typeof result ===
      "string"
      ? result
      : data?.guid ??
        data?.id ??
        data?.data?.guid ??
        null;

  return {
    submitted: true,
    verificationId,
    data,
  };
}

/* =========================================================
   CHECK GUID
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
      !response.ok
    ) {
      return {
        verified: false,
        pending: false,
        failed: false,
      };
    }

    /*
     * CRITICAL:
     *
     * Even if the GUID says "Pass",
     * verify the actual source code afterward.
     */
    const text =
      getStatusText(
        data
      );

    if (
      text.includes(
        "pass"
      ) &&
      text.includes(
        "verified"
      )
    ) {
      return {
        verified: true,
        pending: false,
        failed: false,
      };
    }

    if (
      text.includes(
        "pending"
      ) ||
      text.includes(
        "queue"
      ) ||
      text.includes(
        "processing"
      ) ||
      text.includes(
        "progress"
      )
    ) {
      return {
        verified: false,
        pending: true,
        failed: false,
      };
    }

    if (
      text.includes(
        "fail"
      ) ||
      text.includes(
        "error"
      ) ||
      text.includes(
        "mismatch"
      ) ||
      text.includes(
        "invalid"
      )
    ) {
      return {
        verified: false,
        pending: false,
        failed: true,
      };
    }

    return {
      verified: false,
      pending: false,
      failed: false,
    };
  } catch {
    return {
      verified: false,
      pending: false,
      failed: false,
    };
  }
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  const {
    searchParams,
  } = new URL(
    request.url
  );

  /* -------------------------------------------------------
     ARTIFACT
  ------------------------------------------------------- */

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
        JSON.parse(
          raw
        ) as Artifact;

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

  /* -------------------------------------------------------
     STANDARD JSON
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     CHECK ADDRESS
  ------------------------------------------------------- */

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

  /*
   * IMPORTANT:
   *
   * verified is ONLY true when the explorer's
   * actual source/ABI says it is verified.
   */
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
          verified: false,
          error:
            "A valid contract address is required.",
        },
        400
      );
    }

    /* -----------------------------------------------------
       1. AUTHORITATIVE CHECK BEFORE SUBMISSION
    ----------------------------------------------------- */

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
          "Contract is already verified on the IOPn Explorer.",
      });
    }

    /* -----------------------------------------------------
       2. WAIT FOR INDEXING
    ----------------------------------------------------- */

    const indexed =
      before.indexed
        ? before
        : await waitForIndexing(
            address
          );

    if (
      indexed.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified:
          true,
        submitted: false,
        message:
          "Contract is already verified on the IOPn Explorer.",
      });
    }

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
          "The explorer has not indexed this contract yet.",
      });
    }

    /* -----------------------------------------------------
       3. SUBMIT
    ----------------------------------------------------- */

    const submission =
      await submitVerification(
        body
      );

    /* -----------------------------------------------------
       4. IMMEDIATE AUTHORITATIVE CHECK
    ----------------------------------------------------- */

    const immediate =
      await checkContract(
        address
      );

    if (
      immediate.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified:
          false,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Contract is verified on the IOPn Explorer.",
      });
    }

    /* -----------------------------------------------------
       5. POLL GUID
    ----------------------------------------------------- */

    if (
      submission.verificationId
    ) {
      for (
        let attempt = 1;
        attempt <=
        VERIFICATION_ATTEMPTS;
        attempt++
      ) {
        await sleep(
          VERIFICATION_DELAY
        );

        const guidState =
          await checkVerificationGuid(
            submission.verificationId
          );

        if (
          guidState.failed
        ) {
          break;
        }

        if (
          guidState.verified
        ) {
          /*
           * Do NOT trust GUID alone.
           *
           * Verify actual explorer source.
           */
          const finalState =
            await checkContract(
              address
            );

          if (
            finalState.verified
          ) {
            return json({
              success: true,
              verified: true,
              submitted: true,
              verificationId:
                submission.verificationId,
              message:
                "Contract is verified on the IOPn Explorer.",
            });
          }

          /*
           * GUID says pass but source isn't visible yet.
           */
          continue;
        }
      }
    }

    /* -----------------------------------------------------
       6. FINAL AUTHORITATIVE CHECK
    ----------------------------------------------------- */

    const finalState =
      await checkContract(
        address
      );

    if (
      finalState.verified
    ) {
      return json({
        success: true,
        verified: true,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Contract is verified on the IOPn Explorer.",
      });
    }

    /* -----------------------------------------------------
       7. SUBMITTED BUT NOT VERIFIED
    ----------------------------------------------------- */

    return json({
      success: true,

      verified: false,

      submitted:
        submission.submitted,

      waitingForIndexing:
        false,

      verificationId:
        submission.verificationId,

      message:
        "Verification was submitted, but the explorer has not confirmed the source code as verified yet.",
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