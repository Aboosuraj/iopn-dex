import fs from "fs";
import path from "path";
import solc from "solc";

const ROOT = process.cwd();

const contractPath = path.resolve(
  ROOT,
  "contracts/IOPnToken.sol"
);

const artifactDir = path.resolve(
  ROOT,
  "artifacts"
);

const publicArtifactDir = path.resolve(
  ROOT,
  "public/artifacts"
);

const contractName = "IOPnToken";
const sourceName = "IOPnToken.sol";

const optimizerEnabled = true;
const optimizerRuns = 200;

/*
 * IMPORTANT
 *
 * Do not force "osaka" here.
 *
 * The contract should be compiled with the default EVM target,
 * matching the deployment environment unless the IOPn explorer
 * specifically requires another target.
 */
const evmVersion = undefined;

console.log("");
console.log("🔨 Compiling IOPnToken...");
console.log("");

if (!fs.existsSync(contractPath)) {
  console.error(
    `❌ ERROR: ${contractPath} does not exist.`
  );

  process.exit(1);
}

const source = fs.readFileSync(
  contractPath,
  "utf8"
);

const installedSolcVersion = solc.version();
const compilerVersion = `v${installedSolcVersion}`;

console.log(
  `📄 Source: ${contractPath}`
);

console.log(
  `⚙️ Compiler: ${compilerVersion}`
);

console.log(
  `🔧 Optimizer: ${optimizerEnabled}`
);

console.log(
  `🔢 Optimization runs: ${optimizerRuns}`
);

console.log(
  `🔴 EVM version: ${evmVersion}`
);

console.log("");

/*
 * Solidity Standard JSON Input
 */
const compilerInput = {
  language: "Solidity",

  sources: {
    [sourceName]: {
      content: source,
    },
  },

  settings: {
    optimizer: {
      enabled: optimizerEnabled,
      runs: optimizerRuns,
    },

    outputSelection: {
      "*": {
        "*": [
          "abi",
          "metadata",
          "evm.bytecode",
          "evm.deployedBytecode",
        ],
      },
    },
  },
};

/*
 * Compile
 */
let output;

try {
  output = JSON.parse(
    solc.compile(
      JSON.stringify(compilerInput)
    )
  );
} catch (error) {
  console.error("");
  console.error(
    "❌ solc compilation crashed."
  );
  console.error(error);
  process.exit(1);
}

/*
 * Compiler messages
 */
if (output.errors) {
  for (const error of output.errors) {
    const message =
      error.formattedMessage ||
      error.message ||
      String(error);

    if (error.severity === "error") {
      console.error(message);
    } else {
      console.warn(message);
    }
  }

  const hasError = output.errors.some(
    (error) =>
      error.severity === "error"
  );

  if (hasError) {
    console.error("");
    console.error(
      "❌ Compilation failed."
    );

    process.exit(1);
  }
}

/*
 * Find contract
 */
const contracts =
  output.contracts?.[sourceName];

if (!contracts) {
  console.error(
    "❌ ERROR: No contracts were produced."
  );

  process.exit(1);
}

const contract =
  contracts[contractName];

if (!contract) {
  console.error(
    `❌ ERROR: Contract "${contractName}" was not found.`
  );

  console.log(
    "Available contracts:",
    Object.keys(contracts)
  );

  process.exit(1);
}

/*
 * Bytecode
 */
const creationBytecode =
  contract.evm?.bytecode?.object || "";

const deployedBytecode =
  contract.evm?.deployedBytecode?.object || "";

if (!creationBytecode) {
  console.error(
    "❌ ERROR: Creation bytecode is empty."
  );

  process.exit(1);
}

if (!deployedBytecode) {
  console.error(
    "❌ ERROR: Deployed bytecode is empty."
  );

  process.exit(1);
}

/*
 * Create directories
 */
fs.mkdirSync(
  artifactDir,
  {
    recursive: true,
  }
);

fs.mkdirSync(
  publicArtifactDir,
  {
    recursive: true,
  }
);

/*
 * Complete artifact
 */
const artifact = {
  contractName,

  sourceName,

  compiler: {
    name: "solc",
    version: compilerVersion,
    fullVersion: installedSolcVersion,
  },

  optimization: {
    enabled: optimizerEnabled,
    runs: optimizerRuns,
  },

  evmVersion,

  sourceCode: source,

  compilerInput,

  abi: contract.abi,

  bytecode: creationBytecode,

  deployedBytecode,

  metadata:
    contract.metadata || null,
};

/*
 * Verification metadata
 */
const verificationMetadata = {
  contractName,

  sourceName,

  compiler: {
    name: "solc",
    version: compilerVersion,
    fullVersion: installedSolcVersion,
  },

  optimization: {
    enabled: optimizerEnabled,
    runs: optimizerRuns,
  },

  evmVersion,

  generatedAt:
    new Date().toISOString(),
};

/*
 * Write files
 */
const artifactPath =
  path.join(
    artifactDir,
    "IOPnToken.json"
  );

const standardInputPath =
  path.join(
    artifactDir,
    "IOPnToken-standard-input.json"
  );

const verificationPath =
  path.join(
    artifactDir,
    "IOPnToken-verification.json"
  );

fs.writeFileSync(
  artifactPath,
  JSON.stringify(
    artifact,
    null,
    2
  )
);

fs.writeFileSync(
  standardInputPath,
  JSON.stringify(
    compilerInput,
    null,
    2
  )
);

fs.writeFileSync(
  verificationPath,
  JSON.stringify(
    verificationMetadata,
    null,
    2
  )
);

/*
 * Copy artifacts to public/artifacts
 *
 * Your existing /deploy page loads these files
 * from /artifacts/...
 */
const publicArtifactPath =
  path.join(
    publicArtifactDir,
    "IOPnToken.json"
  );

const publicStandardInputPath =
  path.join(
    publicArtifactDir,
    "IOPnToken-standard-input.json"
  );

const publicVerificationPath =
  path.join(
    publicArtifactDir,
    "IOPnToken-verification.json"
  );

fs.copyFileSync(
  artifactPath,
  publicArtifactPath
);

fs.copyFileSync(
  standardInputPath,
  publicStandardInputPath
);

fs.copyFileSync(
  verificationPath,
  publicVerificationPath
);

/*
 * Final output
 */
console.log(
  "===================================="
);

console.log(
  "✅ IOPnToken compiled successfully"
);

console.log(
  "===================================="
);

console.log("");

console.log(
  "📋 Verification configuration:"
);

console.log(
  `Contract:          ${contractName}`
);

console.log(
  `Source:            ${sourceName}`
);

console.log(
  `Compiler:          ${compilerVersion}`
);

console.log(
  `Optimization:      ${optimizerEnabled}`
);

console.log(
  `Optimization runs: ${optimizerRuns}`
);

console.log(
  `EVM version:       ${evmVersion}`
);

console.log("");

console.log(
  "📦 Generated files:"
);

console.log(
  `   ${artifactPath}`
);

console.log(
  `   ${standardInputPath}`
);

console.log(
  `   ${verificationPath}`
);

console.log("");

console.log(
  "🌐 Public copies:"
);

console.log(
  `   ${publicArtifactPath}`
);

console.log(
  `   ${publicStandardInputPath}`
);

console.log(
  `   ${publicVerificationPath}`
);

console.log("");

console.log(
  `🔨 Creation bytecode: ${creationBytecode.length / 2} bytes`
);

console.log(
  `🔨 Deployed bytecode: ${deployedBytecode.length / 2} bytes`
);

console.log("");

console.log(
  "🚀 Compilation artifact ready for automatic verification."
);

console.log("");