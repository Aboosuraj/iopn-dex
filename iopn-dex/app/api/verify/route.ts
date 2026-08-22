import {
  NextRequest,
  NextResponse,
} from "next/server";

const EXPLORER_URL =
  (
    process.env.IOPN_EXPLORER_URL ||
    "https://testnet.iopn.tech"
  ).replace(/\/+$/, "");

const EXPLORER_API =
  `${EXPLORER_URL}/api/v2`;

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

function validAddress(
  address: string
) {
  return /^0x[a-fA-F0-9]{40}$/.test(
    address
  );
}

/*
 * ---------------------------------------------------------
 * Explorer contract lookup
 * ---------------------------------------------------------
 */

async function getContract(
  address: string
) {
  const response =
    await fetch(
      `${EXPLORER_API}/smart-contracts/${address}`,
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
 * ---------------------------------------------------------
 * Determine actual explorer verification state
 * ---------------------------------------------------------
 */

function isExplorerVerified(
  data: any
) {
  if (!data) {
    return false;
  }

  /*
   * Blockscout V2 normally exposes verification through
   * is_verified.
   */

  if (
    data.is_verified === true ||
    data.isVerified === true
  ) {
    return true;
  }

  /*
   * Some explorer responses expose source_code or
   * sourceCode when source has been published.
   */

  const sourceCode =
    data.source_code ??
    data.sourceCode ??
    data.SourceCode;

  if (
    typeof sourceCode === "string" &&
    sourceCode.trim()
  ) {
    const lower =
      sourceCode.toLowerCase();

    if (
      !lower.includes(
        "contract source code not verified"
      )
    ) {
      return true;
    }
  }

  /*
   * Some versions expose an ABI after verification.
   */

  const abi =
    data.abi ??
    data.ABI;

  if (
    typeof abi === "string" &&
    abi.trim()
  ) {
    const lower =
      abi.toLowerCase();

    if (
      !lower.includes(
        "contract source code not verified"
      )
    ) {
      return true;
    }
  }

  return false;
}

/*
 * ---------------------------------------------------------
 * GET
 *
 * /api/verify?address=0x...
 *
 * This endpoint ONLY checks the explorer.
 * It NEVER submits verification.
 * ---------------------------------------------------------
 */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

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

    const {
      response,
      data,
    } =
      await getContract(
        address
      );

    if (!response.ok) {
      return json({
        success: true,
        address,
        verified: false,
        indexed: false,
        explorerConfirmed: false,
        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,
        data,
      });
    }

    const verified =
      isExplorerVerified(
        data
      );

    return json({
      success: true,
      address,
      verified,
      indexed: true,
      explorerConfirmed:
        verified,
      explorerUrl:
        `${EXPLORER_URL}/address/${address}?tab=contract`,
    });
  } catch (error) {
    console.error(
      "Explorer verification check failed:",
      error
    );

    return json({
      success: false,
      verified: false,
      indexed: false,
      explorerConfirmed: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to check explorer verification.",
    });
  }
}