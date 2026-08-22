import { NextRequest, NextResponse } from "next/server";

const EXPLORER_API =
  "https://testnet.iopn.tech/api/v2";

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();

    const address = incoming.get("address");
    const compilerVersion =
      incoming.get("compiler_version");
    const contractName =
      incoming.get("contract_name");
    const licenseType =
      incoming.get("license_type");
    const constructorArgs =
      incoming.get("constructor_args");
    const standardInput =
      incoming.get("standard_input");

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
          message:
            "Missing verification parameters.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * BUILD EXPLORER FORM
     * -------------------------------------------------------
     */

    const form = new FormData();

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

    /*
     * IOPn Explorer expects Standard JSON
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

    /*
     * -------------------------------------------------------
     * CONSTRUCTOR ARGUMENTS
     * -------------------------------------------------------
     */

    if (
      typeof constructorArgs === "string" &&
      constructorArgs.trim().length > 0
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

    /*
     * -------------------------------------------------------
     * SUBMIT TO IOPN EXPLORER
     * -------------------------------------------------------
     */

    const explorerResponse = await fetch(
      `${EXPLORER_API}/smart-contracts/${address}/verification/via/standard-input`,
      {
        method: "POST",
        body: form,
        cache: "no-store",
      }
    );

    const responseText =
      await explorerResponse.text();

    let explorerData: unknown;

    try {
      explorerData =
        JSON.parse(responseText);
    } catch {
      explorerData = {
        message: responseText,
      };
    }

    /*
     * -------------------------------------------------------
     * EXPLORER ERROR
     * -------------------------------------------------------
     */

    if (!explorerResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          submitted: false,
          verified: false,
          explorerConfirmed: false,
          status:
            explorerResponse.status,
          data: explorerData,
        },
        {
          status:
            explorerResponse.status,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * SUCCESSFULLY SUBMITTED
     *
     * IMPORTANT:
     *
     * Submission is NOT verification.
     *
     * The deploy page must check the Explorer separately
     * before displaying "Verified".
     * -------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      submitted: true,
      verified: false,
      explorerConfirmed: false,
      data: explorerData,
      message:
        "Verification submitted to the IOPn Explorer. Waiting for Explorer confirmation.",
    });
  } catch (error) {
    console.error(
      "IOPn automatic verification error:",
      error
    );

    return NextResponse.json(
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
      { status: 500 }
    );
  }
}