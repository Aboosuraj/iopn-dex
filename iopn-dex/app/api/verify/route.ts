import { NextRequest, NextResponse } from "next/server";

const EXPLORER_API = "https://testnet.iopn.tech/api/v2";

const POLL_ATTEMPTS = 20;
const POLL_DELAY = 3000;

type VerifyBody = {
  address?: string;

  compilerVersion?: string;
  compiler_version?: string;

  contractName?: string;
  contract_name?: string;

  licenseType?: string;
  license_type?: string;

  constructorArgs?: string;
  constructor_args?: string;

  standardInput?: string;
  standard_input?: string;
};

function isAddress(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(value)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function explorerRequest(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
  });

  const text = await response.text();

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    response,
    data,
    text,
  };
}

/* =========================================================
   GET
   Check contract status
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const address =
      request.nextUrl.searchParams.get(
        "address"
      );

    if (!isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error:
            "A valid contract address is required.",
        },
        { status: 400 }
      );
    }

    const result =
      await explorerRequest(
        `${EXPLORER_API}/smart-contracts/${address}`
      );

    if (!result.response.ok) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          address,
          error:
            result.data?.message ||
            result.data?.error ||
            "Unable to query Explorer.",
          explorerResponse:
            result.data,
        },
        { status: 502 }
      );
    }

    const contract =
      result.data;

    const isVerified =
      contract?.is_verified === true;

    const isFullyVerified =
      contract?.is_fully_verified === true;

    const isPartiallyVerified =
      contract?.is_partially_verified === true;

    /*
     * The smart-contract endpoint itself means
     * the address is indexed as a contract.
     *
     * Do not rely on a top-level is_contract field.
     */

    const isContract = true;

    return NextResponse.json({
      success: true,

      verified:
        isVerified ||
        isFullyVerified,

      address,

      indexed: true,

      isContract,

      isVerified,

      isFullyVerified,

      isPartiallyVerified,

      name:
        contract?.name ??
        null,

      compilerVersion:
        contract?.compiler_version ??
        null,

      evmVersion:
        contract?.evm_version ??
        null,

      optimizationEnabled:
        contract?.optimization_enabled ??
        null,

      optimizationRuns:
        contract?.optimization_runs ??
        null,

      constructorArgs:
        contract?.constructor_args ??
        null,

      decodedConstructorArgs:
        contract?.decoded_constructor_args ??
        null,

      sourceAvailable:
        !!contract?.source_code,

      abiAvailable:
        Array.isArray(contract?.abi),

      explorerResponse:
        contract,
    });
  } catch (error) {
    console.error(
      "GET /api/verify error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Verification status request failed.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST
   Submit verification
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as VerifyBody;

    const address =
      body.address;

    const compilerVersion =
      body.compilerVersion ??
      body.compiler_version;

    const contractName =
      body.contractName ??
      body.contract_name;

    const licenseType =
      body.licenseType ??
      body.license_type;

    const constructorArgs =
      body.constructorArgs ??
      body.constructor_args;

    const standardInput =
      body.standardInput ??
      body.standard_input;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "A valid contract address is required.",
        },
        { status: 400 }
      );
    }

    if (
      !compilerVersion ||
      typeof compilerVersion !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Compiler version is required.",
        },
        { status: 400 }
      );
    }

    if (
      !contractName ||
      typeof contractName !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Contract name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !licenseType ||
      typeof licenseType !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "License type is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof standardInput !== "string" ||
      !standardInput.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Standard JSON compiler input is required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VALIDATE STANDARD JSON
    ===================================================== */

    let parsedStandardInput: any;

    try {
      parsedStandardInput =
        JSON.parse(
          standardInput
        );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            error instanceof Error
              ? `Invalid Standard JSON: ${error.message}`
              : "Invalid Standard JSON.",
        },
        { status: 400 }
      );
    }

    if (
      !parsedStandardInput.language
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Standard JSON is missing language.",
        },
        { status: 400 }
      );
    }

    if (
      !parsedStandardInput.sources ||
      typeof parsedStandardInput.sources !==
        "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Standard JSON is missing sources.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CONSTRUCTOR ARGUMENTS
    ===================================================== */

    if (
      typeof constructorArgs !== "string" ||
      !constructorArgs.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Exact encoded constructor arguments are required.",
        },
        { status: 400 }
      );
    }

    const cleanConstructorArgs =
      constructorArgs
        .trim()
        .replace(/^0x/i, "")
        .replace(/\s+/g, "");

    if (
      !/^[0-9a-fA-F]+$/.test(
        cleanConstructorArgs
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Constructor arguments must contain only hexadecimal characters.",
        },
        { status: 400 }
      );
    }

    if (
      cleanConstructorArgs.length % 2 !==
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Constructor arguments have an invalid hexadecimal length.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK CURRENT STATUS
    ===================================================== */

    try {
      const current =
        await explorerRequest(
          `${EXPLORER_API}/smart-contracts/${address}`
        );

      if (
        current.response.ok &&
        current.data?.is_verified === true
      ) {
        return NextResponse.json({
          success: true,
          submitted: false,
          verified: true,
          address,
          contractName,
          compilerVersion,
          message:
            "Contract is already verified.",
          explorerResponse:
            current.data,
        });
      }
    } catch {
      // Continue with verification.
    }

    /* =====================================================
       BUILD ETHERSCAN-COMPATIBLE REQUEST
    ===================================================== */

    const params =
      new URLSearchParams();

    params.set(
      "module",
      "contract"
    );

    params.set(
      "action",
      "verifysourcecode"
    );

    params.set(
      "codeformat",
      "solidity-standard-json-input"
    );

    params.set(
      "contractaddress",
      address
    );

    params.set(
      "contractname",
      contractName
    );

    params.set(
      "compilerversion",
      compilerVersion
    );

    /*
     * Standard JSON compiler input.
     */
    params.set(
      "sourceCode",
      standardInput
    );

    /*
     * Optimization information.
     *
     * The Standard JSON already contains:
     *
     * optimizer.enabled = true
     * optimizer.runs = 200
     *
     * But these fields are useful for Etherscan-style
     * implementations that still inspect them.
     */
    params.set(
      "optimizationUsed",
      parsedStandardInput?.settings
        ?.optimizer?.enabled
        ? "1"
        : "0"
    );

    params.set(
      "runs",
      String(
        parsedStandardInput?.settings
          ?.optimizer?.runs ??
          200
      )
    );

    /*
     * ABI-encoded constructor arguments.
     */
    params.set(
      "constructorArguements",
      cleanConstructorArgs
    );

    /*
     * Some Etherscan-compatible implementations
     * use this correctly spelled variant.
     */
    params.set(
      "constructorArguments",
      cleanConstructorArgs
    );

    /*
     * License.
     */
    params.set(
      "licenseType",
      licenseType
    );

    const verificationUrl =
      `${EXPLORER_API}?${params.toString()}`;

    console.log(
      "Submitting verification to:",
      verificationUrl.replace(
        standardInput,
        `[STANDARD_JSON_${standardInput.length}_CHARS]`
      )
    );

    /* =====================================================
       SUBMIT
    ===================================================== */

    const submission =
      await explorerRequest(
        verificationUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            Accept:
              "application/json",
          },

          body:
            params.toString(),
        }
      );

    console.log(
      "Verification submission status:",
      submission.response.status
    );

    console.log(
      "Verification submission response:",
      submission.data
    );

    if (
      !submission.response.ok
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          verified: false,
          address,
          error:
            submission.data?.message ||
            submission.data?.result ||
            submission.data?.error ||
            `Explorer verification request failed (${submission.response.status}).`,
          explorerResponse:
            submission.data,
        },
        { status: 502 }
      );
    }

    /*
     * Etherscan-compatible response normally looks like:
     *
     * {
     *   status: "1",
     *   message: "OK",
     *   result: "GUID"
     * }
     */

    const submissionResult =
      submission.data?.result;

    const guid =
      typeof submissionResult ===
        "string"
        ? submissionResult
        : null;

    /*
     * If the Explorer directly says the contract
     * was verified, we're done.
     */

    if (
      submission.data?.status === "1" &&
      typeof guid === "string" &&
      guid.toLowerCase() ===
        "already verified"
    ) {
      return NextResponse.json({
        success: true,
        submitted: true,
        verified: true,
        address,
        contractName,
        compilerVersion,
        constructorArgs:
          cleanConstructorArgs,
        message:
          "Contract is already verified.",
      });
    }

    if (!guid) {
      return NextResponse.json({
        success: true,
        submitted: true,
        verified: false,
        address,
        contractName,
        compilerVersion,
        constructorArgs:
          cleanConstructorArgs,
        message:
          "Verification request was accepted, but the Explorer did not return a verification GUID.",
        explorerResponse:
          submission.data,
      });
    }

    /* =====================================================
       POLL VERIFICATION STATUS
    ===================================================== */

    for (
      let attempt = 1;
      attempt <= POLL_ATTEMPTS;
      attempt++
    ) {
      await sleep(
        POLL_DELAY
      );

      const statusUrl =
        `${EXPLORER_API}?module=contract&action=checkverifystatus&guid=${encodeURIComponent(
          guid
        )}`;

      const status =
        await explorerRequest(
          statusUrl
        );

      console.log(
        `Verification status ${attempt}/${POLL_ATTEMPTS}:`,
        status.data
      );

      const result =
        String(
          status.data?.result ??
            ""
        ).toLowerCase();

      if (
        result.includes(
          "pass - verified"
        ) ||
        result.includes(
          "verified successfully"
        ) ||
        result === "pass"
      ) {
        return NextResponse.json({
          success: true,
          submitted: true,
          verified: true,
          address,
          contractName,
          compilerVersion,
          constructorArgs:
            cleanConstructorArgs,
          verificationStatus:
            "verified",
          attempts:
            attempt,
          explorerResponse:
            status.data,
        });
      }

      if (
        result.includes(
          "fail"
        ) ||
        result.includes(
          "unable to verify"
        ) ||
        result.includes(
          "unknown uid"
        )
      ) {
        return NextResponse.json({
          success: true,
          submitted: true,
          verified: false,
          address,
          contractName,
          compilerVersion,
          constructorArgs:
            cleanConstructorArgs,
          verificationStatus:
            "failed",
          attempts:
            attempt,
          error:
            status.data?.result ||
            "Explorer could not verify the contract.",
          explorerResponse:
            status.data,
        });
      }
    }

    /* =====================================================
       STILL PROCESSING
    ===================================================== */

    return NextResponse.json({
      success: true,

      submitted: true,

      verified: false,

      address,

      contractName,

      compilerVersion,

      constructorArgs:
        cleanConstructorArgs,

      verificationStatus:
        "processing",

      guid,

      message:
        "Verification was submitted successfully. The Explorer is still processing the request.",

      explorerResponse:
        submission.data,
    });
  } catch (error) {
    console.error(
      "POST /api/verify error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        submitted: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : "Verification request failed.",
      },
      { status: 500 }
    );
  }
}