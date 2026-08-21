import {
  NextRequest,
  NextResponse,
} from "next/server";

import { isAddress } from "viem";

/* =========================================================
   CONFIG
========================================================= */

const EXPLORER_URL =
  "https://testnet.iopn.tech";

const BLOCKSCOUT_API =
  `${EXPLORER_URL}/api/v2`;

const CONTRACT_READY_INTERVAL = 2000;

const CONTRACT_READY_MAX_ATTEMPTS = 30;

/* =========================================================
   TYPES
========================================================= */

type VerifyRequest = {
  address?: string;

  contractName?: string;

  compilerVersion?: string;

  licenseType?: string;

  standardInput?: string;

  constructorArgs?: string;

  autodetectConstructorArgs?: boolean;
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
   CHECK CONTRACT
========================================================= */

async function getContractInfo(
  address: string
) {
  const response =
    await fetch(
      `${BLOCKSCOUT_API}/smart-contracts/${address}`,
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
    response.status === 404
  ) {
    return {
      exists: false,
      isContract: false,
      isVerified: false,
      isFullyVerified: false,
      data: null,
    };
  }

  if (!response.ok) {
    return {
      exists: false,
      isContract: false,
      isVerified: false,
      isFullyVerified: false,
      data: null,
    };
  }

  const data =
    await response.json();

  return {
    exists: true,

    /*
     * A successful response from the smart-contract
     * endpoint means Blockscout recognizes this address
     * as a smart contract.
     */
    isContract: true,

    isVerified:
      data?.is_verified === true,

    isFullyVerified:
      data?.is_fully_verified === true,

    data,
  };
}

/* =========================================================
   WAIT FOR CONTRACT INDEXING
========================================================= */

async function waitForContract(
  address: string
) {
  for (
    let attempt = 1;
    attempt <=
    CONTRACT_READY_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      const info =
        await getContractInfo(
          address
        );

      if (
        info.isContract ||
        info.isVerified ||
        info.isFullyVerified
      ) {
        return info;
      }
    } catch (error) {
      console.warn(
        "Explorer contract lookup failed:",
        error
      );
    }

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

  return null;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const address =
      request.nextUrl.searchParams.get(
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

    if (!isAddress(address)) {
      return json(
        {
          success: false,
          error:
            "Invalid contract address.",
        },
        400
      );
    }

    const info =
      await getContractInfo(
        address
      );

    return json({
      success: true,

      address,

      isContract:
        info.isContract,

      isVerified:
        info.isVerified,

      isFullyVerified:
        info.isFullyVerified,

      verified:
        info.isVerified ||
        info.isFullyVerified,

      data:
        info.data,
    });
  } catch (error) {
    console.error(
      "GET /api/verify failed:",
      error
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to check contract status.",
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
      (await request.json()) as VerifyRequest;

    /* -----------------------------------------------------
       VALIDATE ADDRESS
    ----------------------------------------------------- */

    const address =
      body.address?.trim();

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

    if (!isAddress(address)) {
      return json(
        {
          success: false,
          error:
            "Invalid contract address.",
        },
        400
      );
    }

    /* -----------------------------------------------------
       VALIDATE CONTRACT NAME
    ----------------------------------------------------- */

    const contractName =
      body.contractName?.trim();

    if (!contractName) {
      return json(
        {
          success: false,
          error:
            "Contract name is required.",
        },
        400
      );
    }

    /* -----------------------------------------------------
       VALIDATE COMPILER
    ----------------------------------------------------- */

    const compilerVersion =
      body.compilerVersion?.trim();

    if (!compilerVersion) {
      return json(
        {
          success: false,
          error:
            "Compiler version is required.",
        },
        400
      );
    }

    /* -----------------------------------------------------
       VALIDATE STANDARD INPUT
    ----------------------------------------------------- */

    const standardInput =
      body.standardInput;

    if (
      !standardInput ||
      !standardInput.trim()
    ) {
      return json(
        {
          success: false,
          error:
            "Standard JSON compiler input is required.",
        },
        400
      );
    }

    /*
     * Confirm that it is valid JSON before sending
     * it to the explorer.
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
            "The Standard JSON compiler input is not valid JSON.",
        },
        400
      );
    }

    /* -----------------------------------------------------
       LICENSE
    ----------------------------------------------------- */

    const licenseType =
      body.licenseType?.trim() ||
      "mit";

    /* -----------------------------------------------------
       CONSTRUCTOR ARGS
    ----------------------------------------------------- */

    const constructorArgs =
      body.constructorArgs
        ?.trim() || "";

    /*
     * The frontend already ABI-encodes the constructor.
     *
     * Blockscout's current Standard JSON verification
     * endpoint expects constructor_args without 0x.
     */
    const cleanConstructorArgs =
      constructorArgs
        .replace(/^0x/i, "")
        .trim();

    /* -----------------------------------------------------
       WAIT FOR EXPLORER INDEXING
    ----------------------------------------------------- */

    const contractInfo =
      await waitForContract(
        address
      );

    if (!contractInfo) {
      return json(
        {
          success: false,

          error:
            "The IOPn Explorer has not indexed this contract yet.",

          code:
            "CONTRACT_NOT_INDEXED",

          retryable: true,
        },
        409
      );
    }

    /*
     * If already verified, don't submit another
     * verification request.
     */
    if (
      contractInfo.isVerified ||
      contractInfo.isFullyVerified
    ) {
      return json({
        success: true,

        alreadyVerified: true,

        verified: true,

        isVerified:
          contractInfo.isVerified,

        isFullyVerified:
          contractInfo.isFullyVerified,

        address,
      });
    }

    /* -----------------------------------------------------
       BUILD MULTIPART FORM
    ----------------------------------------------------- */

    const form =
      new FormData();

    /*
     * Standard JSON input.
     *
     * The explorer's current Blockscout API expects
     * the JSON compiler input as files[0].
     */
    const standardInputBlob =
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
      standardInputBlob,
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
      String(
        body.autodetectConstructorArgs ??
          false
      )
    );

    /*
     * Only include constructor args when they exist.
     */
    if (
      cleanConstructorArgs
    ) {
      form.append(
        "constructor_args",
        cleanConstructorArgs
      );
    }

    /* -----------------------------------------------------
       SUBMIT TO BLOCKSCOUT
    ----------------------------------------------------- */

    const verificationEndpoint =
      `${BLOCKSCOUT_API}/smart-contracts/${address}/verification/via/standard-input`;

    console.log(
      "Submitting automatic verification:",
      {
        address,
        contractName,
        compilerVersion,
        licenseType,
        constructorArgsLength:
          cleanConstructorArgs.length,
      }
    );

    const verificationResponse =
      await fetch(
        verificationEndpoint,
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

    const responseText =
      await verificationResponse.text();

    let responseData:
      | Record<string, unknown>
      | null = null;

    try {
      responseData =
        responseText
          ? JSON.parse(
              responseText
            )
          : null;
    } catch {
      responseData = null;
    }

    console.log(
      "Explorer verification response:",
      {
        status:
          verificationResponse.status,

        response:
          responseData ||
          responseText,
      }
    );

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    if (
      verificationResponse.ok
    ) {
      /*
       * Blockscout's newer verification endpoint can
       * return an empty successful response.
       *
       * Therefore HTTP 200/201/202 is considered an
       * accepted verification request.
       */
      return json({
        success: true,

        submitted: true,

        verified: false,

        address,

        message:
          "Contract verification request accepted by the IOPn Explorer.",

        explorerResponse:
          responseData ||
          responseText ||
          null,
      });
    }

    /* -----------------------------------------------------
       ALREADY VERIFIED / DUPLICATE
    ----------------------------------------------------- */

    const explorerMessage =
      responseData?.message ||
      responseData?.error ||
      responseData?.detail ||
      responseText ||
      "Explorer rejected the verification request.";

    const explorerMessageText =
      String(
        explorerMessage
      );

    if (
      /already verified/i.test(
        explorerMessageText
      ) ||
      /already submitted/i.test(
        explorerMessageText
      ) ||
      /verified/i.test(
        explorerMessageText
      )
    ) {
      /*
       * Re-check actual contract state instead of
       * trusting the error message.
       */
      const latest =
        await getContractInfo(
          address
        );

      if (
        latest.isVerified ||
        latest.isFullyVerified
      ) {
        return json({
          success: true,

          submitted: true,

          alreadyVerified: true,

          verified: true,

          isVerified:
            latest.isVerified,

          isFullyVerified:
            latest.isFullyVerified,

          address,
        });
      }
    }

    /* -----------------------------------------------------
       FAILURE
    ----------------------------------------------------- */

    return json(
      {
        success: false,

        error:
          explorerMessageText,

        status:
          verificationResponse.status,

        address,

        explorerResponse:
          responseData ||
          responseText ||
          null,
      },
      502
    );
  } catch (error) {
    console.error(
      "POST /api/verify failed:",
      error
    );

    return json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Automatic contract verification failed.",

        retryable: true,
      },
      500
    );
  }
}