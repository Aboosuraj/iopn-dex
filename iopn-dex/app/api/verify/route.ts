import {
  NextRequest,
  NextResponse,
} from "next/server";

const EXPLORER_URL = (
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

/*
 * Explorer is the ONLY source of truth.
 *
 * Do not infer verification from:
 * - HTTP 200
 * - verification request ID
 * - submitted status
 * - ABI
 * - source_code text
 */
function isExplorerVerified(
  data: any
) {
  if (!data) {
    return false;
  }

  return (
    data.is_verified === true ||
    data.isVerified === true
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(
        request.url
      );

    const address =
      searchParams.get(
        "address"
      );

    if (!address) {
      return json(
        {
          success: false,
          verified: false,
          indexed: false,
          explorerConfirmed:
            false,
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
          indexed: false,
          explorerConfirmed:
            false,
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

    /*
     * 404 means Explorer does not know
     * the contract yet.
     */
    if (
      !response.ok
    ) {
      return json({
        success: true,
        address,
        verified: false,
        indexed: false,
        explorerConfirmed:
          false,
        explorerUrl:
          `${EXPLORER_URL}/address/${address}?tab=contract`,
      });
    }

    const verified =
      isExplorerVerified(
        data
      );

    return json({
      success: true,
      address,

      /*
       * Indexed means Explorer knows
       * about the contract.
       */
      indexed: true,

      /*
       * This is ONLY true when Explorer
       * explicitly confirms verification.
       */
      verified,

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
      explorerConfirmed:
        false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to check Explorer verification.",
    });
  }
}