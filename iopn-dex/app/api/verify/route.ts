import { NextRequest, NextResponse } from "next/server";

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const API_URL =
  `${EXPLORER_URL}/api/v2`;

const DEFAULT_LICENSE =
  "mit";

function isAddress(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(value)
  );
}

function cleanHex(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/^0x/i, "")
    .replace(/\s+/g, "");
}

function extractErrorMessage(
  value: unknown
): string {
  if (!value) {
    return "Unknown explorer error.";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const object =
      value as Record<string, unknown>;

    if (
      typeof object.message === "string"
    ) {
      return object.message;
    }

    if (
      typeof object.error === "string"
    ) {
      return object.error;
    }

    if (
      typeof object.result === "string"
    ) {
      return object.result;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown explorer error.";
    }
  }

  return String(value);
}

/*
 * GET
 *
 * Check verification status for a contract.
 *
 * /api/verify?address=0x...
 */
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
        {
          status: 400,
        }
      );
    }

    const response =
      await fetch(
        `${API_URL}/smart-contracts/${address}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    const text =
      await response.text();

    let data: unknown = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          explorerStatus:
            response.status,
          explorerResponse: data,
        },
        {
          status: response.status,
        }
      );
    }

    const object =
      data &&
      typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};

    const verified =
      object.is_verified === true ||
      object.is_fully_verified === true;

    return NextResponse.json({
      success: true,

      verified,

      address,

      isVerified:
        object.is_verified ?? false,

      isFullyVerified:
        object.is_fully_verified ?? false,

      isPartiallyVerified:
        object.is_partially_verified ??
        false,

      name:
        object.name ?? null,

      compilerVersion:
        object.compiler_version ??
        null,

      evmVersion:
        object.evm_version ??
        null,

      optimizationEnabled:
        object.optimization_enabled ??
        null,

      optimizationRuns:
        object.optimizations_runs ??
        null,

      verifiedAt:
        object.verified_at ??
        null,

      explorerResponse: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * POST
 *
 * Submit Standard JSON Input verification.
 */
export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const address =
      body?.address;

    const compilerVersion =
      body?.compilerVersion;

    const contractName =
      body?.contractName ||
      "IOPnToken";

    const standardInput =
      body?.standardInput;

    const constructorArgs =
      cleanHex(
        body?.constructorArgs
      );

    const autodetectConstructorArgs =
      body?.autodetectConstructorArgs !==
      false;

    const licenseType =
      body?.licenseType ||
      DEFAULT_LICENSE;

    if (!isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid contract address.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof compilerVersion !==
        "string" ||
      !compilerVersion.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Compiler version is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof standardInput !==
        "string" ||
      !standardInput.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Standard JSON compiler input is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate Standard JSON before sending it.
     */
    try {
      JSON.parse(
        standardInput
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "standardInput is not valid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Modern Blockscout API:
     *
     * POST
     * /api/v2/smart-contracts/{address}
     * /verification/via/standard-input
     */
    const verificationUrl =
      `${API_URL}/smart-contracts/${address}/verification/via/standard-input`;

    const formData =
      new FormData();

    formData.append(
      "compiler_version",
      compilerVersion.trim()
    );

    formData.append(
      "contract_name",
      contractName.trim()
    );

    /*
     * Blockscout expects the Standard JSON
     * input as files[0].
     */
    const sourceFile =
      new File(
        [
          standardInput,
        ],
        "IOPnToken-standard-input.json",
        {
          type:
            "application/json",
        }
      );

    formData.append(
      "files[0]",
      sourceFile
    );

    formData.append(
      "autodetect_constructor_args",
      autodetectConstructorArgs
        ? "true"
        : "false"
    );

    /*
     * Only send constructor_args when
     * we actually have them.
     *
     * This is important because an empty
     * constructor argument string must not
     * be confused with real constructor data.
     */
    if (constructorArgs) {
      formData.append(
        "constructor_args",
        constructorArgs
      );
    }

    formData.append(
      "license_type",
      licenseType
    );

    const explorerResponse =
      await fetch(
        verificationUrl,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",
          },

          body: formData,

          cache: "no-store",
        }
      );

    const responseText =
      await explorerResponse.text();

    let responseData: unknown =
      null;

    try {
      responseData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      responseData =
        responseText;
    }

    /*
     * Blockscout's modern endpoint can
     * return 200/204 after accepting the
     * verification request.
     */
    if (
      !explorerResponse.ok
    ) {
      return NextResponse.json(
        {
          success: false,

          submitted: false,

          error:
            extractErrorMessage(
              responseData
            ),

          status:
            explorerResponse.status,

          explorerResponse:
            responseData,
        },
        {
          status:
            explorerResponse.status,
        }
      );
    }

    /*
     * Immediately check current verification
     * status. It may still be processing.
     */
    let verified = false;

    try {
      const statusResponse =
        await fetch(
          `${API_URL}/smart-contracts/${address}`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

      if (
        statusResponse.ok
      ) {
        const statusData =
          await statusResponse.json();

        verified =
          statusData?.is_verified ===
            true ||
          statusData?.is_fully_verified ===
            true;
      }
    } catch {
      /*
       * Submission itself succeeded.
       * Status checking can be retried
       * by the frontend.
       */
    }

    return NextResponse.json({
      success: true,

      submitted: true,

      verified,

      address,

      contractName,

      compilerVersion:
        compilerVersion.trim(),

      autodetectConstructorArgs,

      constructorArgs:
        constructorArgs || null,

      explorerResponse:
        responseData,

      message: verified
        ? "Contract is verified."
        : "Verification request accepted. The explorer may still be processing it.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,

        submitted: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}