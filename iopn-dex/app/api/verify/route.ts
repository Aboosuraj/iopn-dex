import {
  NextRequest,
  NextResponse,
} from "next/server";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const API_URL =
  `${EXPLORER_URL}/api/v2`;

const DEFAULT_LICENSE =
  "mit";

const DEFAULT_CONTRACT_NAME =
  "IOPnToken";

/*
 * The explorer needs time to index a freshly deployed
 * contract before verification can be submitted.
 */
const CONTRACT_READY_INTERVAL =
  2000;

const CONTRACT_READY_MAX_ATTEMPTS =
  20;

/* =========================================================
   HELPERS
========================================================= */

function isAddress(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^0x[a-fA-F0-9]{40}$/.test(
      value.trim()
    )
  );
}

function cleanHex(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .replace(
      /^0x/i,
      ""
    )
    .replace(
      /\s+/g,
      ""
    );
}

function extractErrorMessage(
  value: unknown
): string {
  if (!value) {
    return "Unknown explorer error.";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const object =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof object.message ===
      "string"
    ) {
      return object.message;
    }

    if (
      typeof object.error ===
      "string"
    ) {
      return object.error;
    }

    if (
      typeof object.result ===
      "string"
    ) {
      return object.result;
    }

    if (
      typeof object.detail ===
      "string"
    ) {
      return object.detail;
    }

    try {
      return JSON.stringify(
        value
      );
    } catch {
      return "Unknown explorer error.";
    }
  }

  return String(value);
}

async function readResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return text;
  }
}

function explorerVerified(
  data: unknown
): boolean {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return false;
  }

  const object =
    data as Record<
      string,
      unknown
    >;

  return (
    object.is_verified ===
      true ||
    object.is_fully_verified ===
      true
  );
}

/*
 * Blockscout's address endpoint can take a short
 * time to recognize a freshly deployed contract.
 *
 * We specifically wait for:
 *
 * is_contract === true
 *
 * before calling the verification endpoint.
 */
async function waitForContractRecognition(
  address: string
) {
  let lastData: unknown =
    null;

  let lastStatus =
    0;

  for (
    let attempt = 1;
    attempt <=
    CONTRACT_READY_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/addresses/${address}`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

      lastStatus =
        response.status;

      const data =
        await readResponse(
          response
        );

      lastData = data;

      /*
       * Explorer recognized it.
       */
      if (
        response.ok &&
        data &&
        typeof data ===
          "object"
      ) {
        const object =
          data as Record<
            string,
            unknown
          >;

        if (
          object.is_contract ===
          true
        ) {
          console.log(
            "Explorer recognized contract:",
            {
              address,
              attempt,
            }
          );

          return {
            ready: true,
            data,
            status:
              response.status,
          };
        }
      }
    } catch (error) {
      console.warn(
        "Contract recognition check failed:",
        error
      );
    }

    /*
     * Do not wait after the final attempt.
     */
    if (
      attempt <
      CONTRACT_READY_MAX_ATTEMPTS
    ) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            CONTRACT_READY_INTERVAL
          )
      );
    }
  }

  return {
    ready: false,
    data: lastData,
    status: lastStatus,
  };
}

/* =========================================================
   GET
   Check actual verification status
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const address =
      request.nextUrl.searchParams.get(
        "address"
      ) ??
      request.nextUrl.searchParams.get(
        "contractAddress"
      );

    if (
      !isAddress(address)
    ) {
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

    const normalizedAddress =
      address.trim();

    /*
     * Query the explorer's smart-contract
     * endpoint.
     */
    const response =
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

    const data =
      await readResponse(
        response
      );

    /*
     * A newly deployed contract may return
     * 404 here while the explorer is indexing.
     *
     * That is NOT a verification failure.
     */
    if (
      response.status ===
      404
    ) {
      return NextResponse.json({
        success: true,
        verified: false,
        address:
          normalizedAddress,
        indexed: false,
        isVerified: false,
        isFullyVerified: false,
        message:
          "Contract has not been indexed by the explorer yet.",
        explorerResponse:
          data,
      });
    }

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          address:
            normalizedAddress,
          explorerStatus:
            response.status,
          explorerResponse:
            data,
        },
        {
          status:
            response.status,
        }
      );
    }

    const object =
      data &&
      typeof data ===
        "object"
        ? (
            data as Record<
              string,
              unknown
            >
          )
        : {};

    const verified =
      explorerVerified(
        data
      );

    return NextResponse.json({
      success: true,

      verified,

      address:
        normalizedAddress,

      indexed: true,

      isContract:
        object.is_contract ??
        false,

      isVerified:
        object.is_verified ??
        false,

      isFullyVerified:
        object.is_fully_verified ??
        false,

      isPartiallyVerified:
        object.is_partially_verified ??
        false,

      name:
        object.name ??
        null,

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
        object.optimization_runs ??
        null,

      verifiedAt:
        object.verified_at ??
        null,

      explorerResponse:
        data,
    });
  } catch (error) {
    console.error(
      "Verification status error:",
      error
    );

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

/* =========================================================
   POST
   Submit automatic Standard JSON verification
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * The deploy page sends JSON.
     */
    const body =
      await request.json();

    const address =
      body?.address ??
      body?.contractAddress;

    if (
      !isAddress(address)
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Invalid contract address.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedAddress =
      address.trim();

    /* =====================================================
       COMPILER
    ===================================================== */

    const compilerVersion =
      typeof body?.compilerVersion ===
      "string"
        ? body.compilerVersion.trim()
        : "";

    if (!compilerVersion) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Compiler version is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CONTRACT NAME
    ===================================================== */

    const contractName =
      typeof body?.contractName ===
        "string" &&
      body.contractName.trim()
        ? body.contractName.trim()
        : DEFAULT_CONTRACT_NAME;

    /* =====================================================
       STANDARD INPUT
    ===================================================== */

    const standardInput =
      typeof body?.standardInput ===
      "string"
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
        {
          status: 400,
        }
      );
    }

    /*
     * Make sure the Standard JSON is valid.
     */
    let parsedStandardInput:
      unknown;

    try {
      parsedStandardInput =
        JSON.parse(
          standardInput
        );
    } catch {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "standardInput is not valid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CONSTRUCTOR
    ===================================================== */

    const constructorArgs =
      cleanHex(
        body?.constructorArgs
      );

    if (
      constructorArgs &&
      !/^[a-fA-F0-9]+$/.test(
        constructorArgs
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "constructorArgs must contain only hexadecimal characters.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Your constructor contains:
     *
     * string
     * string
     * uint256
     * uint8
     * address
     *
     * Therefore the encoded constructor data should
     * be non-empty and have an even number of hex
     * characters.
     */
    if (
      !constructorArgs ||
      constructorArgs.length %
        2 !==
        0
    ) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          error:
            "Exact encoded constructor arguments are required.",
        },
        {
          status: 400,
        }
      );
    }

    const autodetectConstructorArgs =
      body?.autodetectConstructorArgs ===
      true;

    /* =====================================================
       LICENSE
    ===================================================== */

    const licenseType =
      typeof body?.licenseType ===
        "string" &&
      body.licenseType.trim()
        ? body.licenseType.trim()
        : DEFAULT_LICENSE;

    /* =====================================================
       LOG
    ===================================================== */

    console.log(
      "Automatic verification requested:",
      {
        address:
          normalizedAddress,

        contractName,

        compilerVersion,

        licenseType,

        constructorArgsBytes:
          constructorArgs.length /
          2,

        autodetectConstructorArgs,

        standardInputBytes:
          Buffer.byteLength(
            standardInput,
            "utf8"
          ),
      }
    );

    /* =====================================================
       WAIT FOR EXPLORER CONTRACT INDEXING
    ===================================================== */

    console.log(
      "Waiting for explorer to recognize contract:",
      normalizedAddress
    );

    const recognition =
      await waitForContractRecognition(
        normalizedAddress
      );

    if (
      !recognition.ready
    ) {
      return NextResponse.json(
        {
          success: false,

          submitted: false,

          verified: false,

          address:
            normalizedAddress,

          error:
            "The contract transaction is confirmed, but the IOPn Explorer has not indexed this address as a smart-contract yet. Please try verification again shortly.",

          explorerStatus:
            recognition.status,

          explorerResponse:
            recognition.data,
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       VERIFICATION ENDPOINT
    ===================================================== */

    const verificationUrl =
      `${API_URL}/smart-contracts/${normalizedAddress}/verification/via/standard-input`;

    /*
     * Blockscout requires multipart/form-data.
     *
     * files[0] contains the Standard JSON input.
     */
    const form =
      new FormData();

    form.append(
      "compiler_version",
      compilerVersion
    );

    form.append(
      "contract_name",
      contractName
    );

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

    form.append(
      "files[0]",
      sourceFile
    );

    form.append(
      "license_type",
      licenseType
    );

    /*
     * We use the EXACT constructor data generated
     * by encodeAbiParameters().
     */
    form.append(
      "constructor_args",
      constructorArgs
    );

    /*
     * Since exact constructor args are supplied,
     * explicitly disable autodetection.
     */
    form.append(
      "autodetect_constructor_args",
      autodetectConstructorArgs
        ? "true"
        : "false"
    );

    console.log(
      "Submitting verification:",
      {
        verificationUrl,

        address:
          normalizedAddress,

        contractName,

        compilerVersion,

        constructorArgsBytes:
          constructorArgs.length /
          2,
      }
    );

    /* =====================================================
       SUBMIT
    ===================================================== */

    const explorerResponse =
      await fetch(
        verificationUrl,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",
          },

          body: form,

          cache: "no-store",
        }
      );

    const responseData =
      await readResponse(
        explorerResponse
      );

    if (
      !explorerResponse.ok
    ) {
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

          verified: false,

          address:
            normalizedAddress,

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

    /* =====================================================
       IMMEDIATE STATUS CHECK
    ===================================================== */

    let verified =
      false;

    let verificationStatus:
      unknown = null;

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

      if (
        statusResponse.ok
      ) {
        verified =
          explorerVerified(
            verificationStatus
          );
      }
    } catch (statusError) {
      console.warn(
        "Immediate verification status check failed:",
        statusError
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json({
      success: true,

      submitted: true,

      verified,

      address:
        normalizedAddress,

      contractName,

      compilerVersion,

      licenseType,

      constructorArgs,

      constructorArgsBytes:
        constructorArgs.length /
        2,

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