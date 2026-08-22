import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ARTIFACT_PATH = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken.json"
);

const STANDARD_INPUT_PATH = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken-standard-input.json"
);

const VERIFICATION_PATH = path.join(
  process.cwd(),
  "artifacts",
  "IOPnToken-verification.json"
);

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET() {
  try {
    const [
      artifactRaw,
      standardInput,
      verificationRaw,
    ] = await Promise.all([
      fs.readFile(
        ARTIFACT_PATH,
        "utf8"
      ),

      fs.readFile(
        STANDARD_INPUT_PATH,
        "utf8"
      ),

      fs.readFile(
        VERIFICATION_PATH,
        "utf8"
      ).catch(() => "{}"),
    ]);

    const artifact =
      JSON.parse(artifactRaw);

    const verification =
      JSON.parse(verificationRaw);

    if (
      !artifact?.abi ||
      !Array.isArray(artifact.abi)
    ) {
      return json(
        {
          success: false,
          error:
            "IOPnToken ABI is missing from the artifact.",
        },
        500
      );
    }

    if (
      !artifact?.bytecode ||
      typeof artifact.bytecode !==
        "string"
    ) {
      return json(
        {
          success: false,
          error:
            "IOPnToken bytecode is missing from the artifact.",
        },
        500
      );
    }

    if (
      !standardInput.trim()
    ) {
      return json(
        {
          success: false,
          error:
            "IOPnToken Standard JSON input is empty.",
        },
        500
      );
    }

    /*
     * Make sure the Standard JSON is
     * actually valid JSON.
     */
    JSON.parse(
      standardInput
    );

    return json({
      success: true,

      artifact: {
        abi: artifact.abi,
        bytecode: artifact.bytecode,
      },

      standardInput,

      verification: {
        ...verification,

        method:
          "Solidity (Standard JSON input)",

        compilerVersion:
          "v0.8.36+commit.8a079791",

        optimizationEnabled: true,

        optimizationRuns: 200,

        license: "mit",
      },
    });
  } catch (error) {
    console.error(
      "Unable to load IOPnToken deployment artifacts:",
      error
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load deployment artifacts.",
      },
      500
    );
  }
}