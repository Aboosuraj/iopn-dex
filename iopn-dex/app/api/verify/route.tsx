import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| IOPn Explorer Contract Verification
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This API NEVER considers a contract verified merely because:
|
| - deployment succeeded
| - verification was submitted
| - a GUID was returned
| - the explorer returned HTTP 200
| - the explorer returned "OK"
|
| `verified: true` is returned ONLY when the explorer itself exposes
| verified source code for the contract address.
|
|--------------------------------------------------------------------------
*/

const EXPLORER_URL = (
  process.env.IOPN_EXPLORER_URL ||
  "https://testnet.iopn.tech"
).replace(/\/+$/, "");

const EXPLORER_API_URL = (
  process.env.IOPN_EXPLORER_API_URL ||
  `${EXPLORER_URL}/api`
).replace(/\/+$/, "");

const ARTIFACT_FILE = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken.json"
);

const STANDARD_INPUT_FILE = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken-standard-input.json"
);

/*
|--------------------------------------------------------------------------
| Timing
|--------------------------------------------------------------------------
*/

const INDEX_ATTEMPTS = 20;
const INDEX_DELAY = 3000;

const VERIFY_ATTEMPTS = 30;
const VERIFY_DELAY = 5000;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

type ExplorerCheck = {
  verified: boolean;
  indexed: boolean;
  data: unknown;
};

/*
|--------------------------------------------------------------------------
| Response helper
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| General helpers
|--------------------------------------------------------------------------
*/

function sleep(
  ms: number
) {
  return new Promise<void>(
    (resolve) => setTimeout(resolve, ms)
  );
}

function validAddress(
  address: string
) {
  return /^0x[a-fA-F0-9]{40}$/.test(
    address
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
|--------------------------------------------------------------------------
| Explorer GET
|--------------------------------------------------------------------------
*/

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
    data = JSON.parse(text);
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

/*
|--------------------------------------------------------------------------
| Explorer POST
|--------------------------------------------------------------------------
*/

async function explorerPost(
  form: URLSearchParams
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
          form.toString(),
      }
    );

  const text =
    await response.text();

  let data: any;

  try {
    data = JSON.parse(text);
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

/*
|--------------------------------------------------------------------------
| Extract explorer contract result
|--------------------------------------------------------------------------
*/

function getContractResult(
  data: any
) {
  if (
    Array.isArray(data?.result)
  ) {
    return data.result[0] || null;
  }

  if (
    data?.result &&
    typeof data.result === "object"
  ) {
    return data.result;
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data[0] || null;
  }

  if (
    data?.data &&
    typeof data.data === "object"
  ) {
    return data.data;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| AUTHORITATIVE VERIFICATION CHECK
|--------------------------------------------------------------------------
|
| This is the most important function in this file.
|
| The application is NOT allowed to decide that a contract is verified.
|
| The explorer decides.
|
|--------------------------------------------------------------------------
*/

function explorerConfirmsVerification(
  data: any
) {
  const result =
    getContractResult(data);

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

  if (
    typeof sourceCode !== "string" ||
    !sourceCode.trim()
  ) {
    return false;
  }

  if (
    sourceCode
      .toLowerCase()
      .includes(
        "contract source code not verified"
      )
  ) {
    return false;
  }

  if (
    typeof abi !== "string" ||
    !abi.trim()
  ) {
    return false;
  }

  if (
    abi
      .toLowerCase()
      .includes(
        "contract source code not verified"
      )
  ) {
    return false;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| Check explorer
|--------------------------------------------------------------------------
*/

async function checkExplorer(
  address: string
): Promise<ExplorerCheck> {
  try {
    const {
      response,
      data,
    } =
      await explorerGet({
        module: "contract",
        action: "getsourcecode",
        address,
      });

    if (!response.ok) {
      return {
        verified: false,
        indexed: false,
        data,
      };
    }

    const result =
      getContractResult(data);

    const indexed =
      !!result;

    const verified =
      explorerConfirmsVerification(
        data
      );

    return {
      verified,
      indexed,
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

/*
|--------------------------------------------------------------------------
| Blockscout V2 check
|--------------------------------------------------------------------------
|
| Used only as a fallback for checking the explorer.
|
| It does NOT submit verification.
|--------------------------------------------------------------------------
*/

async function checkBlockscoutV2(
  address: string
): Promise<ExplorerCheck> {
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
        verified: false,
        indexed: false,
        data: null,
      };
    }

    const data =
      await response.json();

    const indexed =
      !!data;

    const verified =
      data?.is_verified === true ||
      data?.isVerified === true;

    return {
      verified,
      indexed,
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

/*
|--------------------------------------------------------------------------
| AUTHORITATIVE CHECK
|--------------------------------------------------------------------------
*/

async function checkContract(
  address: string
): Promise<ExplorerCheck> {
  /*
   * First use Etherscan-compatible endpoint.
   */
  const etherscan =
    await checkExplorer(
      address
    );

  if (etherscan.verified) {
    return etherscan;
  }

  /*
   * If explorer knows the contract but it is not verified,
   * return that state.
   */
  if (etherscan.indexed) {
    return etherscan;
  }

  /*
   * Blockscout V2 fallback.
   */
  const blockscout =
    await checkBlockscoutV2(
      address
    );

  return blockscout;
}

/*
|--------------------------------------------------------------------------
| Wait until explorer indexes contract
|--------------------------------------------------------------------------
*/

async function waitForExplorer(
  address: string
): Promise<ExplorerCheck> {
  for (
    let attempt = 1;
    attempt <= INDEX_ATTEMPTS;
    attempt++
  ) {
    const state =
      await checkContract(
        address
      );

    /*
     * Stop immediately if explorer confirms verification.
     */
    if (state.verified) {
      return state;
    }

    /*
     * Once explorer knows the contract exists,
     * verification can be submitted.
     */
    if (state.indexed) {
      return state;
    }

    if (
      attempt < INDEX_ATTEMPTS
    ) {
      await sleep(
        INDEX_DELAY
      );
    }
  }

  return {
    verified: false,
    indexed: false,
    data: null,
  };
}

/*
|--------------------------------------------------------------------------
| Submit verification
|--------------------------------------------------------------------------
|
| This sends the source to the explorer.
|
| IMPORTANT:
|
| A successful submission does NOT mean verified.
|--------------------------------------------------------------------------
*/

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
    body.standardInput?.trim();

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
   * Etherscan-compatible spelling.
   */
  form.set(
    "constructorArguements",
    constructorArgs
  );

  /*
   * Also provide the correctly-spelled version
   * for compatible explorer implementations.
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

  if (!response.ok) {
    throw new Error(
      `Explorer verification request failed with HTTP ${response.status}.`
    );
  }

  /*
   * Do NOT interpret HTTP 200 as verification.
   */

  const result =
    data?.result;

  const message =
    data?.message;

  const rawText =
    JSON.stringify(data)
      .toLowerCase();

  /*
   * Clear rejection.
   */
  if (
    rawText.includes(
      "error"
    ) &&
    !rawText.includes(
      "guid"
    )
  ) {
    throw new Error(
      String(
        result ||
        message ||
        "Explorer rejected the verification request."
      )
    );
  }

  /*
   * Extract possible verification ID.
   */
  let verificationId:
    | string
    | null = null;

  if (
    typeof result ===
    "string"
  ) {
    verificationId =
      result;
  }

  if (
    typeof data?.guid ===
    "string"
  ) {
    verificationId =
      data.guid;
  }

  if (
    typeof data?.id ===
    "string"
  ) {
    verificationId =
      data.id;
  }

  return {
    submitted: true,
    verificationId,
    response: data,
  };
}

/*
|--------------------------------------------------------------------------
| Check verification GUID
|--------------------------------------------------------------------------
*/

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
        action: "checkverifystatus",
        guid,
      });

    if (!response.ok) {
      return {
        pass: false,
        pending: false,
        failed: false,
        data,
      };
    }

    const text =
      JSON.stringify(data)
        .toLowerCase();

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
        "in progress"
      )
    ) {
      return {
        pass: false,
        pending: true,
        failed: false,
        data,
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
        "invalid"
      ) ||
      text.includes(
        "mismatch"
      )
    ) {
      return {
        pass: false,
        pending: false,
        failed: true,
        data,
      };
    }

    if (
      text.includes(
        "pass"
      ) ||
      text.includes(
        "verified"
      )
    ) {
      return {
        pass: true,
        pending: false,
        failed: false,
        data,
      };
    }

    return {
      pass: false,
      pending: false,
      failed: false,
      data,
    };
  } catch {
    return {
      pass: false,
      pending: false,
      failed: false,
      data: null,
    };
  }
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| GET /api/verify?address=0x...
|
| This endpoint is the source of truth for the frontend.
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest
) {
  const {
    searchParams,
  } =
    new URL(
      request.url
    );

  /*
   * Return artifact.
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

      return json({
        success: true,
        artifact:
          JSON.parse(raw),
      });
    } catch (error) {
      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load artifact.",
        },
        500
      );
    }
  }

  /*
   * Return Standard JSON input.
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
   * Contract address.
   */
  const address =
    searchParams.get(
      "address"
    );

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
    !validAddress(address)
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

  /*
   * NEVER calculate verified locally.
   *
   * The explorer decides.
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

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| POST /api/verify
|
| Flow:
|
| 1. Check explorer.
| 2. Wait for indexing.
| 3. Submit source.
| 4. Poll submission.
| 5. Check explorer source again.
| 6. Only then return verified=true.
|--------------------------------------------------------------------------
*/

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
      !validAddress(address)
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

    /*
     * -------------------------------------------------------
     * STEP 1
     * Check whether explorer already says verified.
     * -------------------------------------------------------
     */

    const before =
      await checkContract(
        address
      );

    if (before.verified) {
      return json({
        success: true,
        verified: true,
        alreadyVerified: true,
        submitted: false,
        message:
          "Explorer confirms that this contract is already verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * STEP 2
     * Wait for explorer indexing.
     * -------------------------------------------------------
     */

    const indexed =
      before.indexed
        ? before
        : await waitForExplorer(
            address
          );

    if (indexed.verified) {
      return json({
        success: true,
        verified: true,
        alreadyVerified: true,
        submitted: false,
        message:
          "Explorer confirms that this contract is verified.",
      });
    }

    if (!indexed.indexed) {
      return json({
        success: true,
        verified: false,
        submitted: false,
        waitingForIndexing: true,
        message:
          "The contract exists on the blockchain, but the explorer has not indexed it yet. Verification was not falsely marked as successful.",
      });
    }

    /*
     * -------------------------------------------------------
     * STEP 3
     * Submit verification.
     * -------------------------------------------------------
     */

    const submission =
      await submitVerification(
        body
      );

    /*
     * -------------------------------------------------------
     * STEP 4
     * Immediately check explorer again.
     * -------------------------------------------------------
     */

    let explorerState =
      await checkContract(
        address
      );

    if (
      explorerState.verified
    ) {
      return json({
        success: true,
        verified: true,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Explorer confirms that the contract is verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * STEP 5
     * Poll verification job if explorer supplied a GUID.
     * -------------------------------------------------------
     */

    if (
      submission.verificationId
    ) {
      for (
        let attempt = 1;
        attempt <= VERIFY_ATTEMPTS;
        attempt++
      ) {
        await sleep(
          VERIFY_DELAY
        );

        const guid =
          await checkVerificationGuid(
            submission.verificationId
          );

        /*
         * Regardless of GUID result,
         * always ask the explorer for the actual source.
         */
        explorerState =
          await checkContract(
            address
          );

        if (
          explorerState.verified
        ) {
          return json({
            success: true,
            verified: true,
            submitted: true,
            verificationId:
              submission.verificationId,
            message:
              "Explorer confirms that the contract is verified.",
          });
        }

        if (
          guid.failed
        ) {
          break;
        }
      }
    }

    /*
     * -------------------------------------------------------
     * STEP 6
     * FINAL AUTHORITATIVE CHECK
     * -------------------------------------------------------
     */

    explorerState =
      await checkContract(
        address
      );

    if (
      explorerState.verified
    ) {
      return json({
        success: true,
        verified: true,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Explorer confirms that the contract is verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * STEP 7
     * IMPORTANT
     *
     * Submission happened, but explorer does NOT confirm
     * verification.
     * Therefore verified MUST remain false.
     * -------------------------------------------------------
     */

    return json({
      success: true,

      verified: false,

      submitted:
        submission.submitted,

      verificationId:
        submission.verificationId,

      explorerConfirmed:
        false,

      message:
        "Verification was submitted, but the IOPn Explorer has not confirmed the contract as verified. The app will not mark it as verified.",
    });
  } catch (error) {
    console.error(
      "Contract verification error:",
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