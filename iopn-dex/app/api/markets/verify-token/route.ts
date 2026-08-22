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

export async function POST(
  request: NextRequest
) {
  try {
    const incoming =
      await request.formData();

    const address =
      incoming.get("address");

    const compilerVersion =
      incoming.get(
        "compiler_version"
      );

    const contractName =
      incoming.get(
        "contract_name"
      );

    const licenseType =
      incoming.get(
        "license_type"
      );

    const constructorArgs =
      incoming.get(
        "constructor_args"
      );

    const standardInput =
      incoming.get(
        "standard_input"
      );

    if (
      typeof address !==
        "string" ||
      !validAddress(address)
    ) {
      return json(
        {
          success: false,
          message:
            "A valid contract address is required.",
        },
        400
      );
    }

    if (
      typeof compilerVersion !==
        "string" ||
      !compilerVersion
    ) {
      return json(
        {
          success: false,
          message:
            "Compiler version is required.",
        },
        400
      );
    }

    if (
      typeof contractName !==
        "string" ||
      !contractName
    ) {
      return json(
        {
          success: false,
          message:
            "Contract name is required.",
        },
        400
      );
    }

    if (
      typeof licenseType !==
        "string" ||
      !licenseType
    ) {
      return json(
        {
          success: false,
          message:
            "License type is required.",
        },
        400
      );
    }

    if (
      typeof standardInput !==
        "string" ||
      !standardInput.trim()
    ) {
      return json(
        {
          success: false,
          message:
            "Standard JSON compiler input is required.",
        },
        400
      );
    }

    /*
     * Validate the Standard JSON before
     * sending it to the Explorer.
     */
    try {
      JSON.parse(
        standardInput
      );
    } catch {
      return json(
        {
          success: false,
          message:
            "The Standard JSON compiler input is invalid.",
        },
        400
      );
    }

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

    const standardInputFile =
      new File(
        [standardInput],
        "IOPnToken-standard-input.json",
        {
          type:
            "application/json",
        }
      );

    form.append(
      "files[0]",
      standardInputFile
    );

    form.append(
      "license_type",
      licenseType
    );

    /*
     * Constructor arguments must NOT include 0x.
     */
    if (
      typeof constructorArgs ===
        "string" &&
      constructorArgs.length > 0
    ) {
      form.append(
        "constructor_args",
        constructorArgs.replace(
          /^0x/,
          ""
        )
      );

      form.append(
        "autodetect_constructor_args",
        "false"
      );
    } else {
      form.append(
        "autodetect_constructor_args",
        "true"
      );
    }

    const response =
      await fetch(
        `${EXPLORER_API}/smart-contracts/${address}/verification/via/standard-input`,
        {
          method: "POST",
          body: form,
          cache: "no-store",
        }
      );

    const text =
      await response.text();

    let data: unknown;

    try {
      data =
        JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    if (
      !response.ok
    ) {
      return json(
        {
          success: false,
          submitted: false,
          status:
            response.status,
          data,
        },
        response.status
      );
    }

    /*
     * IMPORTANT:
     *
     * Successful submission does NOT mean
     * verified.
     */
    return json({
      success: true,
      submitted: true,
      verified: false,
      explorerConfirmed: false,
      data,
      message:
        "Verification request submitted to the IOPn Explorer. Waiting for Explorer confirmation.",
    });
  } catch (error) {
    console.error(
      "Automatic contract verification failed:",
      error
    );

    return json(
      {
        success: false,
        submitted: false,
        verified: false,
        explorerConfirmed: false,
        message:
          error instanceof Error
            ? error.message
            : "Automatic verification failed.",
      },
      500
    );
  }
}