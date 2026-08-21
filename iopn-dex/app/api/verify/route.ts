import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL = (
  process.env.IOPN_EXPLORER_URL ||
  "https://testnet.iopn.tech"
).replace(/\/+$/, "");

const EXPLORER_API_URL = (
  process.env.IOPN_EXPLORER_API_URL ||
  `${EXPLORER_URL}/api`
).replace(/\/+$/, "");

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
 * Keep these reasonable because a Vercel/Next.js serverless
 * function should not remain alive indefinitely.
 */
const INDEX_ATTEMPTS = 12;
const INDEX_DELAY = 3000;

const VERIFICATION_ATTEMPTS = 12;
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
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
      setTimeout(resolve, milliseconds)
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

/*
 * Converts any explorer response into a readable string.
 */
function stringifyValue(
  value: unknown
): string {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  try {
    return JSON.stringify(
      value
    );
  } catch {
    return String(value);
  }
}

/* =========================================================
   EXPLORER GET
========================================================= */

async function explorerGet(
  params: Record<string, string>
) {
  const query =
    new URLSearchParams(params);

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

/* =========================================================
   EXPLORER POST
========================================================= */

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
   EXTRACT CONTRACT RESULT
========================================================= */

function getContractResult(
  payload: any
): any | null {
  if (!payload) {
    return null;
  }

  /*
   * Etherscan/Blockscout:
   *
   * result: [...]
   */
  if (
    Array.isArray(
      payload.result
    )
  ) {
    return (
      payload.result[0] ||
      null
    );
  }

  /*
   * Some API wrappers return:
   *
   * data: [...]
   */
  if (
    Array.isArray(
      payload.data
    )
  ) {
    return (
      payload.data[0] ||
      null
    );
  }

  /*
   * Some Blockscout endpoints return
   * the object directly.
   */
  if (
    payload.result &&
    typeof payload.result ===
      "object"
  ) {
    return payload.result;
  }

  if (
    payload.data &&
    typeof payload.data ===
      "object"
  ) {
    return payload.data;
  }

  /*
   * Direct contract object.
   */
  if (
    typeof payload ===
      "object" &&
    (
      payload.address ||
      payload.Address ||
      payload.source_code ||
      payload.sourceCode ||
      payload.SourceCode ||
      payload.is_verified !==
        undefined
    )
  ) {
    return payload;
  }

  return null;
}

/* =========================================================
   SOURCE CODE VERIFICATION
========================================================= */

/*
 * This function is intentionally strict.
 *
 * A contract is NOT considered verified because:
 *
 * - HTTP = 200
 * - API status = 1
 * - message = OK
 * - GUID exists
 * - submission succeeded
 * - explorer indexed the address
 *
 * The explorer must actually expose source code and ABI.
 */

function hasRealSourceCode(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const source =
    value.trim();

  if (!source) {
    return false;
  }

  const normalized =
    source.toLowerCase();

  if (
    normalized.includes(
      "contract source code not verified"
    )
  ) {
    return false;
  }

  if (
    normalized ===
    "0x"
  ) {
    return false;
  }

  return true;
}

function hasRealAbi(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const abi =
    value.trim();

  if (!abi) {
    return false;
  }

  const normalized =
    abi.toLowerCase();

  if (
    normalized.includes(
      "contract source code not verified"
    )
  ) {
    return false;
  }

  /*
   * A valid ABI normally starts with
   * "[".
   */
  try {
    const parsed =
      JSON.parse(abi);

    return Array.isArray(
      parsed
    );
  } catch {
    /*
     * Some explorer installations can
     * return ABI differently.
     *
     * Still require a substantial value.
     */
    return (
      abi.length > 2
    );
  }
}

/* =========================================================
   AUTHORITATIVE SOURCE CHECK
========================================================= */

function sourceCodeFromResult(
  result: any
) {
  return (
    result?.SourceCode ??
    result?.sourceCode ??
    result?.source_code ??
    ""
  );
}

function abiFromResult(
  result: any
) {
  return (
    result?.ABI ??
    result?.abi ??
    ""
  );
}

/* =========================================================
   ETHERSCAN/EXPLORER CHECK
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

  if (!response.ok) {
    return {
      reachable: false,
      indexed: false,
      verified: false,
      data,
    };
  }

  const result =
    getContractResult(
      data
    );

  if (!result) {
    return {
      reachable: true,
      indexed: false,
      verified: false,
      data,
    };
  }

  const source =
    sourceCodeFromResult(
      result
    );

  const abi =
    abiFromResult(
      result
    );

  const verified =
    hasRealSourceCode(
      source
    ) &&
    hasRealAbi(
      abi
    );

  /*
   * Address exists in explorer response,
   * but source may still be unverified.
   */
  return {
    reachable: true,
    indexed: true,
    verified,
    contractName:
      result?.ContractName ??
      result?.contractName ??
      null,
    compilerVersion:
      result?.CompilerVersion ??
      result?.compilerVersion ??
      null,
    source,
    abi,
    data,
  };
}

/* =========================================================
   BLOCKSCOUT V2 CHECK
========================================================= */

async function checkBlockscoutV2(
  address: string
) {
  try {
    const url =
      `${EXPLORER_URL}/api/v2/smart-contracts/${address}`;

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
        reachable: false,
        indexed: false,
        verified: false,
        data: null,
      };
    }

    const data =
      await response.json();

    /*
     * Blockscout V2 normally exposes:
     *
     * is_verified
     */
    if (
      data?.is_verified ===
        true ||
      data?.isVerified ===
        true
    ) {
      return {
        reachable: true,
        indexed: true,
        verified: true,
        data,
      };
    }

    /*
     * Additional source/ABI fallback.
     */
    const source =
      data?.source_code ??
      data?.sourceCode ??
      data?.SourceCode ??
      "";

    const abi =
      data?.abi ??
      data?.ABI ??
      "";

    const verified =
      hasRealSourceCode(
        source
      ) &&
      hasRealAbi(
        abi
      );

    return {
      reachable: true,
      indexed: true,
      verified,
      data,
    };
  } catch {
    return {
      reachable: false,
      indexed: false,
      verified: false,
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
   *
   * This is the primary authority.
   */
  try {
    const explorer =
      await checkExplorerSource(
        address
      );

    if (
      explorer.verified
    ) {
      return explorer;
    }

    /*
     * If explorer has indexed the address,
     * return that information rather than
     * falsely claiming verification.
     */
    if (
      explorer.indexed
    ) {
      return explorer;
    }
  } catch {
    // Continue to Blockscout V2.
  }

  /*
   * SECOND:
   *
   * Blockscout V2.
   */
  const v2 =
    await checkBlockscoutV2(
      address
    );

  return v2;
}

/* =========================================================
   WAIT FOR INDEXING
========================================================= */

async function waitForIndexing(
  address: string
) {
  let lastState: any = {
    indexed: false,
    verified: false,
  };

  for (
    let attempt = 1;
    attempt <= INDEX_ATTEMPTS;
    attempt++
  ) {
    lastState =
      await checkContract(
        address
      );

    /*
     * If source is already verified,
     * stop immediately.
     */
    if (
      lastState.verified
    ) {
      return lastState;
    }

    /*
     * Once the explorer knows the contract,
     * stop waiting for indexing.
     */
    if (
      lastState.indexed
    ) {
      return lastState;
    }

    if (
      attempt <
      INDEX_ATTEMPTS
    ) {
      await sleep(
        INDEX_DELAY
      );
    }
  }

  return lastState;
}

/* =========================================================
   SUBMIT STANDARD JSON VERIFICATION
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

  if (!standardInput.trim()) {
    throw new Error(
      "Standard JSON compiler input is missing."
    );
  }

  /*
   * Blockscout/Etherscan-compatible
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
   * Both spellings are sent because
   * different Etherscan-compatible
   * implementations have historically
   * used different names.
   */
  form.set(
    "constructorArguements",
    constructorArgs
  );

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

  if (!response.ok) {
    throw new Error(
      `Explorer returned HTTP ${response.status}.`
    );
  }

  const result =
    data?.result;

  const message =
    data?.message;

  const rawText =
    `${stringifyValue(message)} ${stringifyValue(result)}`
      .toLowerCase();

  /*
   * Detect an actual rejection.
   */
  const rejected =
    data?.status === "0" &&
    (
      rawText.includes(
        "error"
      ) ||
      rawText.includes(
        "fail"
      ) ||
      rawText.includes(
        "invalid"
      ) ||
      rawText.includes(
        "does not match"
      ) ||
      rawText.includes(
        "unable"
      ) ||
      rawText.includes(
        "not found"
      )
    );

  if (rejected) {
    throw new Error(
      String(
        result ||
          message ||
          "Explorer rejected verification."
      )
    );
  }

  /*
   * IMPORTANT:
   *
   * This is ONLY a submission receipt.
   *
   * It is NOT proof of verification.
   */
  const verificationId =
    typeof result ===
      "string"
      ? result.trim()
      : data?.guid ??
        data?.id ??
        data?.data?.guid ??
        null;

  return {
    submitted: true,
    verificationId:
      verificationId || null,
    data,
  };
}

/* =========================================================
   CHECK VERIFICATION GUID
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

    if (!response.ok) {
      return {
        pending: false,
        passed: false,
        failed: false,
        data,
      };
    }

    const resultText =
      stringifyValue(
        data?.result
      );

    const messageText =
      stringifyValue(
        data?.message
      );

    const combined =
      `${resultText} ${messageText}`
        .toLowerCase();

    /*
     * Explicit failure.
     */
    if (
      combined.includes(
        "fail"
      ) ||
      combined.includes(
        "error"
      ) ||
      combined.includes(
        "mismatch"
      ) ||
      combined.includes(
        "invalid"
      ) ||
      combined.includes(
        "does not match"
      )
    ) {
      return {
        pending: false,
        passed: false,
        failed: true,
        data,
      };
    }

    /*
     * Explicit pending states.
     */
    if (
      combined.includes(
        "pending"
      ) ||
      combined.includes(
        "queue"
      ) ||
      combined.includes(
        "processing"
      ) ||
      combined.includes(
        "progress"
      ) ||
      combined.includes(
        "waiting"
      )
    ) {
      return {
        pending: true,
        passed: false,
        failed: false,
        data,
      };
    }

    /*
     * "Pass" is only a signal that the
     * verification job completed.
     *
     * It is NOT considered final verification.
     */
    if (
      combined.includes(
        "pass"
      ) ||
      combined.includes(
        "verified"
      )
    ) {
      return {
        pending: false,
        passed: true,
        failed: false,
        data,
      };
    }

    return {
      pending: false,
      passed: false,
      failed: false,
      data,
    };
  } catch {
    return {
      pending: false,
      passed: false,
      failed: false,
      data: null,
    };
  }
}

/* =========================================================
   POLL UNTIL ACTUALLY VERIFIED
========================================================= */

async function waitForActualVerification(
  address: string,
  verificationId: string | null
) {
  for (
    let attempt = 1;
    attempt <=
    VERIFICATION_ATTEMPTS;
    attempt++
  ) {
    /*
     * Wait before checking so the explorer
     * has time to process the submission.
     */
    await sleep(
      VERIFICATION_DELAY
    );

    /*
     * FIRST AND MOST IMPORTANT:
     *
     * Check the actual contract source.
     *
     * This prevents false positives.
     */
    const sourceState =
      await checkContract(
        address
      );

    if (
      sourceState.verified
    ) {
      return {
        verified: true,
        failed: false,
        pending: false,
        state: sourceState,
      };
    }

    /*
     * If we have a GUID, check its status
     * for diagnostic purposes.
     */
    if (
      verificationId
    ) {
      const guidState =
        await checkVerificationGuid(
          verificationId
        );

      if (
        guidState.failed
      ) {
        /*
         * Do one final source check before
         * declaring failure.
         */
        const finalState =
          await checkContract(
            address
          );

        if (
          finalState.verified
        ) {
          return {
            verified: true,
            failed: false,
            pending: false,
            state: finalState,
          };
        }

        return {
          verified: false,
          failed: true,
          pending: false,
          state: finalState,
        };
      }
    }
  }

  /*
   * Final authoritative check.
   */
  const finalState =
    await checkContract(
      address
    );

  return {
    verified:
      finalState.verified,
    failed: false,
    pending:
      !finalState.verified,
    state:
      finalState,
  };
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

    /* -----------------------------------------------------
       ARTIFACT
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       STANDARD JSON
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       CHECK ADDRESS
    ----------------------------------------------------- */

    const address =
      searchParams.get(
        "address"
      )?.trim();

    if (!address) {
      return json(
        {
          success: false,
          verified: false,
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
          verified: false,
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
        state.verified === true,

      indexed:
        state.indexed === true,

      explorerUrl:
        `${EXPLORER_URL}/address/${address}?tab=contract`,
    });
  } catch (error) {
    console.error(
      "Verification GET error:",
      error
    );

    return json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to check contract verification.",
      },
      500
    );
  }
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

    /* -----------------------------------------------------
       VALIDATE ADDRESS
    ----------------------------------------------------- */

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

    /*
     * NEVER submit again if the explorer
     * already exposes verified source.
     */
    if (
      before.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified: true,
        submitted: false,
        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,
        message:
          "Contract is already verified on the IOPn Explorer.",
      });
    }

    /* -----------------------------------------------------
       2. WAIT FOR EXPLORER INDEXING
    ----------------------------------------------------- */

    const indexed =
      before.indexed
        ? before
        : await waitForIndexing(
            address
          );

    /*
     * The contract became verified while
     * waiting for indexing.
     */
    if (
      indexed.verified
    ) {
      return json({
        success: true,
        verified: true,
        alreadyVerified: true,
        submitted: false,
        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,
        message:
          "Contract is already verified on the IOPn Explorer.",
      });
    }

    /*
     * Explorer doesn't know the address yet.
     *
     * Do NOT submit verification because
     * the explorer cannot reliably match
     * the deployment yet.
     */
    if (
      !indexed.indexed
    ) {
      return json({
        success: true,
        verified: false,
        submitted: false,
        waitingForIndexing: true,
        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,
        message:
          "The explorer has not indexed this contract yet. Wait a few seconds and try verification again.",
      });
    }

    /* -----------------------------------------------------
       3. SUBMIT STANDARD JSON
    ----------------------------------------------------- */

    const submission =
      await submitVerification(
        body
      );

    /*
     * IMPORTANT:
     *
     * At this point:
     *
     * submitted = true
     * verified  = FALSE
     *
     * The GUID is NOT verification proof.
     */

    /* -----------------------------------------------------
       4. POLL EXPLORER
    ----------------------------------------------------- */

    const verification =
      await waitForActualVerification(
        address,
        submission.verificationId
      );

    /* -----------------------------------------------------
       5. VERIFIED
    ----------------------------------------------------- */

    if (
      verification.verified
    ) {
      return json({
        success: true,

        verified: true,

        submitted: true,

        alreadyVerified: false,

        verificationId:
          submission.verificationId,

        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,

        message:
          "Contract source code is now verified on the IOPn Explorer.",
      });
    }

    /* -----------------------------------------------------
       6. NOT VERIFIED YET
    ----------------------------------------------------- */

    return json({
      success: true,

      verified: false,

      submitted: true,

      alreadyVerified: false,

      waitingForVerification:
        true,

      verificationId:
        submission.verificationId,

      explorerUrl:
        `${EXPLORER_URL}/address/${address}?tab=contract`,

      message:
        verification.failed
          ? "The explorer rejected the verification. Check that the compiler version, optimization settings, contract name, constructor arguments, and Standard JSON input exactly match the deployed contract."
          : "Verification was submitted, but the explorer has not yet confirmed the source code as verified. The contract will remain unverified in the app until the explorer actually exposes the verified source.",
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

        submitted: false,

        error:
          error instanceof Error
            ? error.message
            : "Contract verification failed.",
      },
      500
    );
  }
}