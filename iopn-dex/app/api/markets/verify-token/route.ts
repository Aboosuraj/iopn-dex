import { NextRequest, NextResponse } from "next/server";

const EXPLORER_API =
  "https://testnet.iopn.tech/api/v2";

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();

    const address = incoming.get("address");
    const compilerVersion = incoming.get("compiler_version");
    const contractName = incoming.get("contract_name");
    const licenseType = incoming.get("license_type");
    const constructorArgs = incoming.get("constructor_args");
    const standardInput = incoming.get("standard_input");

    if (
      typeof address !== "string" ||
      typeof compilerVersion !== "string" ||
      typeof contractName !== "string" ||
      typeof licenseType !== "string" ||
      typeof standardInput !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing verification parameters.",
        },
        { status: 400 }
      );
    }

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
     * IOPn Explorer accepts the Standard JSON Input
     * as files[0].
     */
    const standardInputFile = new File(
      [standardInput],
      "IOPnToken-standard-input.json",
      {
        type: "application/json",
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
     * Passing the exact constructor arguments makes
     * verification more reliable.
     */
    if (
      typeof constructorArgs === "string" &&
      constructorArgs.length > 0
    ) {
      form.append(
        "constructor_args",
        constructorArgs.replace(/^0x/, "")
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

    const response = await fetch(
      `${EXPLORER_API}/smart-contracts/${address}/verification/via/standard-input`,
      {
        method: "POST",
        body: form,
        cache: "no-store",
      }
    );

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Automatic contract verification failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Automatic verification failed.",
      },
      { status: 500 }
    );
  }
}