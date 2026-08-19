import { NextResponse } from "next/server";

const EXPLORER_API =
  "https://testnet.iopn.tech/api/v2";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      contractAddress,
      compilerVersion,
      contractName,
      standardInput,
      licenseType = 1,
    } = body;

    if (!contractAddress) {
      return NextResponse.json(
        { success: false, message: "Contract address is required" },
        { status: 400 }
      );
    }

    if (!compilerVersion) {
      return NextResponse.json(
        { success: false, message: "Compiler version is required" },
        { status: 400 }
      );
    }

    if (!contractName) {
      return NextResponse.json(
        { success: false, message: "Contract name is required" },
        { status: 400 }
      );
    }

    if (!standardInput) {
      return NextResponse.json(
        { success: false, message: "Standard JSON input is required" },
        { status: 400 }
      );
    }

    const verificationUrl =
      `${EXPLORER_API}/smart-contracts/${contractAddress}` +
      `/verification/via/standard-input`;

    const formData = new FormData();

    formData.append("compiler_version", compilerVersion);
    formData.append("contract_name", contractName);

    const jsonFile = new File(
      [JSON.stringify(standardInput)],
      "IOPnToken-standard-input.json",
      {
        type: "application/json",
      }
    );

    formData.append("files[0]", jsonFile);
    formData.append("license_type", String(licenseType));

    const response = await fetch(verificationUrl, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    let result: unknown;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        message: text,
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          message:
            typeof result === "object" &&
            result !== null &&
            "message" in result
              ? (result as { message?: string }).message
              : "Contract verification failed",
          result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Smart-contract verification started",
      contractAddress,
      result,
    });
  } catch (error) {
    console.error("Token verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected verification error",
      },
      { status: 500 }
    );
  }
}