import { NextResponse } from "next/server";

const EXPLORER_API = "https://testnet.iopn.tech/api";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const address = String(
      formData.get("address") ?? ""
    ).trim();

    const compilerVersion = String(
      formData.get("compiler_version") ?? ""
    ).trim();

    const contractName = String(
      formData.get("contract_name") ?? ""
    ).trim();

    const licenseType = String(
      formData.get("license_type") ?? ""
    ).trim();

    const constructorArgs = String(
      formData.get("constructor_args") ?? ""
    ).trim();

    const standardInput = String(
      formData.get("standard_input") ?? ""
    );

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Contract address is required.",
        },
        { status: 400 }
      );
    }

    if (!compilerVersion) {
      return NextResponse.json(
        {
          success: false,
          message: "Compiler version is required.",
        },
        { status: 400 }
      );
    }

    if (!contractName) {
      return NextResponse.json(
        {
          success: false,
          message: "Contract name is required.",
        },
        { status: 400 }
      );
    }

    if (!standardInput) {
      return NextResponse.json(
        {
          success: false,
          message: "Standard JSON input is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Explorer expects the constructor arguments
     * WITHOUT the leading 0x.
     */
    const cleanConstructorArgs =
      constructorArgs.startsWith("0x")
        ? constructorArgs.slice(2)
        : constructorArgs;

    /*
     * Submit verification to the IOPn Explorer.
     */
    const explorerForm = new URLSearchParams();

    explorerForm.set(
      "module",
      "contract"
    );

    explorerForm.set(
      "action",
      "verifycontract"
    );

    explorerForm.set(
      "contractaddress",
      address
    );

    explorerForm.set(
      "sourceCode",
      standardInput
    );

    explorerForm.set(
      "codeformat",
      "solidity-standard-json-input"
    );

    explorerForm.set(
      "contractname",
      contractName
    );

    explorerForm.set(
      "compilerversion",
      compilerVersion
    );

    /*
     * Your successful manual verification used:
     *
     * optimizationUsed=1
     * runs=200
     */
    explorerForm.set(
      "optimizationUsed",
      "1"
    );

    explorerForm.set(
      "runs",
      "200"
    );

    /*
     * IMPORTANT:
     *
     * The IOPn Explorer API uses the spelling
     * "constructorArguements".
     *
     * Keep this exact spelling.
     */
    explorerForm.set(
      "constructorArguements",
      cleanConstructorArgs
    );

    /*
     * License type is included when supplied.
     */
    if (licenseType) {
      explorerForm.set(
        "licenseType",
        licenseType
      );
    }

    const response = await fetch(
      EXPLORER_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: explorerForm.toString(),

        cache: "no-store",
      }
    );

    const text =
      await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "IOPn Explorer returned an invalid response.",
          raw: text,
        },
        {
          status: 502,
        }
      );
    }

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "IOPn Explorer rejected the verification request.",
          data,
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * Successful submission normally returns:
     *
     * {
     *   message: "OK",
     *   result: "<GUID>",
     *   status: "1"
     * }
     */
    const result =
      data as {
        status?: string;
        message?: string;
        result?: string;
      };

    if (
      result.status !== "1" ||
      !result.result
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            result.message ||
            "Explorer did not return a verification GUID.",
          data,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Return only the information the frontend needs.
     */
    return NextResponse.json({
      success: true,

      guid: result.result,

      message:
        result.message ||
        "Verification submitted successfully.",
    });
  } catch (error) {
    console.error(
      "IOPn verification API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Internal verification error.",
      },
      {
        status: 500,
      }
    );
  }
}