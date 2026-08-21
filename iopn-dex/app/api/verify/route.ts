import { NextRequest, NextResponse } from "next/server";

const EXPLORER_URL = "https://testnet.iopn.tech";
const API_URL = `${EXPLORER_URL}/api/v2`;

const DEFAULT_LICENSE = "mit";
const DEFAULT_CONTRACT_NAME = "IOPnToken";

function isAddress(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(value.trim())
  );
}

function cleanHex(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/^0x/i, "")
    .replace(/\s+/g, "");
}

function extractErrorMessage(value: unknown): string {
  if (!value) {
    return "Unknown explorer error.";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    const object = value as Record<string, unknown>;

    if (typeof object.message === "string") {
      return object.message;
    }

    if (typeof object.error === "string") {
      return object.error;
    }

    if (typeof object.result === "string") {
      return object.result;
    }

    if (typeof object.detail === "string") {
      return object.detail;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown explorer error.";
    }
  }

  return String(value);
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function explorerVerified(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const object = data as Record<string, unknown>;

  return (
    object.is_verified === true ||
    object.is_fully_verified === true
  );
}

/*
 * GET
 *
 * Check verification status.
 *
 * /api/verify?address=0x...
 */
export async function GET(request: NextRequest) {
  try {
    const address =
      request.nextUrl.searchParams.get("address") ??
      request.nextUrl.searchParams.get("contractAddress");

    if (!isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "A valid contract address is required.",
        },
        { status: 400 }
      );
    }

    const normalizedAddress = address.trim();

    const response = await fetch(
      `${API_URL}/smart-contracts/${normalizedAddress}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          address: normalizedAddress,
          explorerStatus: response.status,
          explorerResponse: data,
        },
        { status: response.status }
      );
    }

    const object =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};

    const verified = explorerVerified(data);

    return NextResponse.json({
      success: true,
      verified,
      address: normalizedAddress,

      isVerified:
        object.is_verified ?? false,

      isFullyVerified:
        object.is_fully_verified ?? false,

      isPartiallyVerified:
        object.is_partially_verified ?? false,

      name:
        object.name ?? null,

      compilerVersion:
        object.compiler_version ?? null,

      evmVersion:
        object.evm_version ?? null,

      optimizationEnabled:
        object.optimization_enabled ?? null,

      optimizationRuns:
        object.optimizations_runs ??
        object.optimization_runs ??
        null,

      verifiedAt:
        object.verified_at ?? null,

      explorerResponse: data,
    });
  } catch (error) {
    console.error("Verification status error:", error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Submit Standard JSON Input verification.
 *
 * Accepts both:
 *
 * address
 *
 * and:
 *
 * contractAddress
 *
 * This keeps the API compatible with the deployment page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    /*
     * Accept BOTH names.
     */
    const address =
      body?.address ??
      body?.contractAddress;

    if (!isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error: "Invalid contract address.",
        },
        { status: 400 }
      );
    }

    const normalizedAddress = address.trim();

    const compilerVersion =
      typeof body?.compilerVersion === "string"
        ? body.compilerVersion.trim()
        : "";

    if (!compilerVersion) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error: "Compiler version is required.",
        },
        { status: 400 }
      );
    }

    const contractName =
      typeof body?.contractName === "string" &&
      body.contractName.trim()
        ? body.contractName.trim()
        : DEFAULT_CONTRACT_NAME;

    const standardInput =
      typeof body?.standardInput === "string"
        ? body.standardInput.trim()
        : "";

    if (!standardInput) {
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

    /*
     * Make sure the Standard JSON is actually valid.
     */
    let parsedStandardInput: unknown;

    try {
      parsedStandardInput =
        JSON.parse(standardInput);
    } catch {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "standardInput is not valid JSON.",
        },
        { status: 400 }
      );
    }

    /*
     * Verify the important compiler settings.
     *
     * We don't modify the user's Standard JSON.
     * We only report what it contains.
     */
    const settings =
      parsedStandardInput &&
      typeof parsedStandardInput === "object"
        ? (
            parsedStandardInput as Record<
              string,
              unknown
            >
          ).settings
        : null;

    const constructorArgs = cleanHex(
      body?.constructorArgs
    );

    const autodetectConstructorArgs =
      body?.autodetectConstructorArgs !== false;

    const licenseType =
      typeof body?.licenseType === "string" &&
      body.licenseType.trim()
        ? body.licenseType.trim()
        : DEFAULT_LICENSE;

    /*
     * Blockscout / IOPn Explorer endpoint.
     */
    const verificationUrl =
      `${API_URL}/smart-contracts/${normalizedAddress}/verification/via/standard-input`;

    const form = new FormData();

    form.append(
      "compiler_version",
      compilerVersion
    );

    form.append(
      "contract_name",
      contractName
    );

    /*
     * Standard JSON Input must be sent
     * as files[0].
     */
    const sourceFile = new File(
      [
        standardInput,
      ],
      "IOPnToken-standard-input.json",
      {
        type: "application/json",
      }
    );

    form.append(
      "files[0]",
      sourceFile
    );

    form.append(
      "license_type",
      licenseType
    );

    /*
     * Constructor handling.
     *
     * If exact constructor arguments are supplied,
     * use them.
     *
     * Otherwise allow explorer autodetection.
     */
    if (constructorArgs) {
      form.append(
        "constructor_args",
        constructorArgs
      );

      form.append(
        "autodetect_constructor_args",
        "false"
      );
    } else {
      form.append(
        "autodetect_constructor_args",
        autodetectConstructorArgs
          ? "true"
          : "false"
      );
    }

    console.log(
      "Submitting automatic verification:",
      {
        address: normalizedAddress,
        contractName,
        compilerVersion,
        licenseType,
        constructorArgsBytes:
          constructorArgs.length / 2,
        autodetectConstructorArgs:
          constructorArgs
            ? false
            : autodetectConstructorArgs,
        verificationUrl,
        evmVersion:
          settings &&
          typeof settings === "object"
            ? (
                settings as Record<
                  string,
                  unknown
                >
              ).evmVersion
            : undefined,
      }
    );

    const explorerResponse = await fetch(
      verificationUrl,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
        },

        body: form,

        cache: "no-store",
      }
    );

    const responseData =
      await readResponse(
        explorerResponse
      );

    if (!explorerResponse.ok) {
      console.error(
        "IOPn Explorer verification rejected:",
        {
          status:
            explorerResponse.status,
          response:
            responseData,
        }
      );

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
     * The explorer accepting the submission does NOT
     * necessarily mean the contract is already verified.
     */
    let verified = false;
    let verificationStatus: unknown = null;

    try {
      const statusResponse =
        await fetch(
          `${API_URL}/smart-contracts/${normalizedAddress}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

      verificationStatus =
        await readResponse(
          statusResponse
        );

      if (statusResponse.ok) {
        verified =
          explorerVerified(
            verificationStatus
          );
      }
    } catch (statusError) {
      console.warn(
        "Could not immediately check verification status:",
        statusError
      );
    }

    return NextResponse.json({
      success: true,
      submitted: true,
      verified,

      address:
        normalizedAddress,

      contractName,

      compilerVersion,

      licenseType,

      autodetectConstructorArgs:
        constructorArgs
          ? false
          : autodetectConstructorArgs,

      constructorArgs:
        constructorArgs || null,

      explorerResponse:
        responseData,

      verificationStatus,

      message: verified
        ? "Contract is verified."
        : "Verification request accepted. The explorer may still be processing it.",
    });
  } catch (error) {
    console.error(
      "Automatic contract verification failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        submitted: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}