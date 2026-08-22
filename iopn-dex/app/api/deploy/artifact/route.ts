import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/*
|--------------------------------------------------------------------------
| IOPn Token Deployment Artifact API
|--------------------------------------------------------------------------
|
| This route ONLY provides the compiled IOPnToken artifact to the deploy
| page.
|
| It does NOT:
| - verify contracts
| - submit verification
| - claim a contract is verified
|
|--------------------------------------------------------------------------
*/

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

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| GET /api/deploy/artifact
|
| Returns:
| - compiled ABI
| - bytecode
| - Standard JSON compiler input
|
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const [artifactRaw, standardInput] =
      await Promise.all([
        fs.readFile(ARTIFACT_PATH, "utf8"),
        fs.readFile(STANDARD_INPUT_PATH, "utf8"),
      ]);

    const artifact = JSON.parse(artifactRaw);

    if (!artifact?.abi) {
      return json(
        {
          success: false,
          error: "IOPnToken ABI is missing from the artifact.",
        },
        500
      );
    }

    if (
      !artifact?.bytecode ||
      typeof artifact.bytecode !== "string"
    ) {
      return json(
        {
          success: false,
          error: "IOPnToken bytecode is missing from the artifact.",
        },
        500
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Return only the information required by the deploy page.
    |--------------------------------------------------------------------------
    */

    return json({
      success: true,

      artifact: {
        abi: artifact.abi,
        bytecode: artifact.bytecode,
      },

      /*
      * This is the exact Standard JSON compiler input that the user can
      * download and upload directly to the IOPn Explorer.
      */
      standardInput,

      verification: {
        method: "Solidity (Standard JSON input)",
        compilerVersion:
          "v0.8.36+commit.8a079791",
        optimizationEnabled: true,
        optimizationRuns: 200,
        license: "MIT",
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