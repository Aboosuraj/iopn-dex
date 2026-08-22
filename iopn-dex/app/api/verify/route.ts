import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EXPLORER_URL = (
  process.env.IOPN_EXPLORER_URL ||
  "https://testnet.iopn.tech"
).replace(/\/+$/, "");

const EXPLORER_API_URL = (
  process.env.IOPN_EXPLORER_API_URL ||
  `${EXPLORER_URL}/api`
).replace(/\/+$/, "");

const STANDARD_INPUT_FILE = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken-standard-input.json"
);

const VERIFY_ATTEMPTS = 12;
const VERIFY_DELAY = 2500;

type VerifyBody = {
  address?: string;
  contractAddress?: string;
  contractName?: string;
  compilerVersion?: string;
  licenseType?: string;
  standardInput?: string;
  constructorArgs?: string;
  optimizationEnabled?: boolean;
  optimizationRuns?: number;
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}

function sleep(ms: number) {
  return new Promise<void>((resolve) =>
    setTimeout(resolve, ms)
  );
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function cleanHex(value?: string) {
  return (value || "")
    .trim()
    .replace(/^0x/i, "");
}

/* =========================================================
   EXPLORER REQUEST
========================================================= */

async function explorerRequest(
  method: "GET" | "POST",
  params?: Record<string, string>
) {
  if (method === "GET") {
    const query = new URLSearchParams(params || {});

    const response = await fetch(
      `${EXPLORER_API_URL}?${query.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const text = await response.text();

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

  const form = new URLSearchParams(
    params || {}
  );

  const response = await fetch(
    EXPLORER_API_URL,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: form.toString(),
    }
  );

  const text = await response.text();

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

/* =========================================================
   EXPLORER CONTRACT RESULT
========================================================= */

function contractResult(data: any) {
  if (Array.isArray(data?.result)) {
    return data.result[0] || null;
  }

  if (
    data?.result &&
    typeof data.result === "object"
  ) {
    return data.result;
  }

  if (Array.isArray(data?.data)) {
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

/* =========================================================
   ACTUAL VERIFIED CHECK
========================================================= */

function sourceIsVerified(data: any) {
  const result = contractResult(data);

  if (
    !result ||
    typeof result !== "object"
  ) {
    return false;
  }

  const source =
    result.SourceCode ??
    result.sourceCode ??
    result.source_code;

  const abi =
    result.ABI ??
    result.abi;

  if (
    typeof source !== "string" ||
    source.trim().length === 0
  ) {
    return false;
  }

  if (
    source
      .toLowerCase()
      .includes(
        "contract source code not verified"
      )
  ) {
    return false;
  }

  if (
    typeof abi !== "string" ||
    abi.trim().length === 0
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

/* =========================================================
   CHECK EXPLORER
========================================================= */

async function checkExplorer(
  address: string
) {
  try {
    const {
      response,
      data,
    } = await explorerRequest(
      "GET",
      {
        module: "contract",
        action: "getsourcecode",
        address,
      }
    );

    if (!response.ok) {
      return {
        verified: false,
        indexed: false,
        data,
      };
    }

    const result =
      contractResult(data);

    /*
     * IMPORTANT:
     *
     * result existing means ONLY that the explorer
     * knows the contract.
     *
     * It does NOT mean verified.
     */
    const indexed =
      !!result;

    const verified =
      sourceIsVerified(data);

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

/* =========================================================
   LOAD STANDARD JSON
========================================================= */

async function loadStandardInput() {
  const raw =
    await fs.readFile(
      STANDARD_INPUT_FILE,
      "utf8"
    );

  if (!raw.trim()) {
    throw new Error(
      "IOPnToken-standard-input.json is empty."
    );
  }

  /*
   * Validate that it is actually JSON.
   */
  JSON.parse(raw);

  return raw;
}

/* =========================================================
   SUBMIT STANDARD JSON
========================================================= */

async function submitVerification(
  body: VerifyBody
) {
  const address =
    (
      body.address ||
      body.contractAddress ||
      ""
    ).trim();

  if (!isAddress(address)) {
    throw new Error(
      "Invalid contract address."
    );
  }

  /*
   * IMPORTANT:
   *
   * Prefer the exact Standard JSON generated during
   * compilation.
   *
   * If the frontend does not send it, load the exact
   * file used by manual verification.
   */
  const standardInput =
    body.standardInput?.trim() ||
    (await loadStandardInput());

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

  const optimizationEnabled =
    body.optimizationEnabled ??
    true;

  const optimizationRuns =
    body.optimizationRuns ??
    200;

  const constructorArgs =
    cleanHex(
      body.constructorArgs
    );

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

  /*
   * THIS IS THE SAME METHOD SELECTED
   * ON THE MANUAL EXPLORER PAGE.
   */
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
   * Etherscan-compatible parameter.
   */
  form.set(
    "constructorArguements",
    constructorArgs
  );

  /*
   * Also send correctly-spelled variant.
   */
  form.set(
    "constructorArguments",
    constructorArgs
  );

  const {
    response,
    data,
  } =
    await explorerRequest(
      "POST",
      Object.fromEntries(
        form.entries()
      )
    );

  if (!response.ok) {
    throw new Error(
      `Explorer returned HTTP ${response.status}.`
    );
  }

  /*
   * Extract GUID if supplied.
   */
  let verificationId:
    | string
    | null = null;

  if (
    typeof data?.result ===
    "string"
  ) {
    verificationId =
      data.result;
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

  /*
   * Detect explicit rejection.
   */
  const text =
    JSON.stringify(data)
      .toLowerCase();

  const rejected =
    text.includes("error") ||
    text.includes("failed") ||
    text.includes("invalid") ||
    text.includes("does not match") ||
    text.includes("mismatch");

  if (rejected) {
    throw new Error(
      String(
        data?.result ||
          data?.message ||
          "Explorer rejected verification."
      )
    );
  }

  return {
    submitted: true,
    verificationId,
    response: data,
  };
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

  /*
   * Artifact endpoint.
   */
  if (
    searchParams.get(
      "artifact"
    ) === "true"
  ) {
    try {
      const artifactFile =
        path.join(
          process.cwd(),
          "artifacts",
          "IOPnToken.json"
        );

      const raw =
        await fs.readFile(
          artifactFile,
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
   * Standard JSON endpoint.
   */
  if (
    searchParams.get(
      "standardInput"
    ) === "true"
  ) {
    try {
      const standardInput =
        await loadStandardInput();

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
              : "Unable to load Standard JSON.",
        },
        500
      );
    }
  }

  /*
   * Contract status.
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

  if (!isAddress(address)) {
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
    await checkExplorer(
      address
    );

  /*
   * CRITICAL:
   *
   * verified comes ONLY from the Explorer source-code
   * response.
   */
  return json({
    success: true,
    address,
    verified:
      state.verified,
    indexed:
      state.indexed,
    explorerConfirmed:
      state.verified,
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
      (
        body.address ||
        body.contractAddress ||
        ""
      ).trim();

    if (!isAddress(address)) {
      return json(
        {
          success: false,
          verified: false,
          submitted: false,
          error:
            "A valid contract address is required.",
        },
        400
      );
    }

    /*
     * -------------------------------------------------------
     * 1. CHECK ACTUAL EXPLORER VERIFICATION
     * -------------------------------------------------------
     */

    let state =
      await checkExplorer(
        address
      );

    if (state.verified) {
      return json({
        success: true,
        verified: true,
        explorerConfirmed: true,
        alreadyVerified: true,
        submitted: false,
        message:
          "Explorer confirms that the contract is already verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * 2. WAIT FOR CONTRACT INDEXING
     * -------------------------------------------------------
     */

    if (!state.indexed) {
      for (
        let attempt = 1;
        attempt <= 20;
        attempt++
      ) {
        await sleep(1500);

        state =
          await checkExplorer(
            address
          );

        if (
          state.verified
        ) {
          return json({
            success: true,
            verified: true,
            explorerConfirmed: true,
            alreadyVerified: true,
            submitted: false,
            message:
              "Explorer confirms that the contract is verified.",
          });
        }

        if (
          state.indexed
        ) {
          break;
        }
      }
    }

    /*
     * IMPORTANT:
     *
     * We do NOT require indexed=true before submitting.
     *
     * The manual Explorer verification page can accept
     * the Standard JSON directly, so the API should attempt
     * the same verification operation.
     */

    /*
     * -------------------------------------------------------
     * 3. SUBMIT EXACT STANDARD JSON
     * -------------------------------------------------------
     */

    const submission =
      await submitVerification(
        body
      );

    /*
     * -------------------------------------------------------
     * 4. CHECK IMMEDIATELY
     * -------------------------------------------------------
     */

    state =
      await checkExplorer(
        address
      );

    if (state.verified) {
      return json({
        success: true,
        verified: true,
        explorerConfirmed: true,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Explorer confirms the contract is verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * 5. POLL EXPLORER
     * -------------------------------------------------------
     *
     * We deliberately check the actual contract source,
     * rather than trusting the GUID.
     */

    for (
      let attempt = 1;
      attempt <= VERIFY_ATTEMPTS;
      attempt++
    ) {
      await sleep(
        VERIFY_DELAY
      );

      state =
        await checkExplorer(
          address
        );

      if (
        state.verified
      ) {
        return json({
          success: true,
          verified: true,
          explorerConfirmed: true,
          submitted: true,
          verificationId:
            submission.verificationId,
          message:
            "Explorer confirms the contract is verified.",
        });
      }
    }

    /*
     * -------------------------------------------------------
     * 6. FINAL CHECK
     * -------------------------------------------------------
     */

    state =
      await checkExplorer(
        address
      );

    /*
     * ONLY HERE can verified=true happen.
     */
    if (state.verified) {
      return json({
        success: true,
        verified: true,
        explorerConfirmed: true,
        submitted: true,
        verificationId:
          submission.verificationId,
        message:
          "Explorer confirms the contract is verified.",
      });
    }

    /*
     * -------------------------------------------------------
     * 7. NOT VERIFIED
     * -------------------------------------------------------
     */

    return json({
      success: true,
      verified: false,
      explorerConfirmed: false,
      submitted: true,
      verificationId:
        submission.verificationId,
      message:
        "Verification was submitted, but the Explorer has not confirmed the source code as verified.",
    });
  } catch (error) {
    console.error(
      "IOPn verification error:",
      error
    );

    return json(
      {
        success: false,
        verified: false,
        explorerConfirmed: false,
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