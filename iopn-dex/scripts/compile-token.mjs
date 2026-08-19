import fs from "fs";
import path from "path";
import solc from "solc";

const contractPath = path.resolve("contracts/IOPnToken.sol");
const artifactDir = path.resolve("artifacts");

const contractName = "IOPnToken";
const sourceName = "IOPnToken.sol";

const optimizerEnabled = true;
const optimizerRuns = 200;
const evmVersion = "default";

console.log("🔨 Compiling IOPnToken...");
console.log("");

if (!fs.existsSync(contractPath)) {
  console.error("❌ ERROR: contracts/IOPnToken.sol does not exist.");
  process.exit(1);
}

const source = fs.readFileSync(contractPath, "utf8");

/*
 * Get the REAL compiler version installed in this project.
 *
 * Example:
 * 0.8.36+commit.8a07979c.Emscripten.clang
 */
const installedSolcVersion = solc.version();

const compilerVersion = `v${installedSolcVersion}`;

console.log(`📄 Source: ${contractPath}`);
console.log(`⚙️ Compiler: ${compilerVersion}`);
console.log(`⚡ Optimizer: ${optimizerEnabled}`);
console.log(`🔁 Optimization runs: ${optimizerRuns}`);
console.log(`🧠 EVM version: ${evmVersion}`);
console.log("");

/*
 * Solidity Standard JSON Input.
 *
 * This exact input will later be used for
 * automatic contract verification.
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

const output = JSON.parse(
  solc.compile(JSON.stringify(compilerInput))
);

/*
 * Handle compiler errors and warnings.
 */
if (output.errors) {
  for (const error of output.errors) {
    console.log(error.formattedMessage);
  }

  const hasError = output.errors.some(
    (error) => error.severity === "error"
  );

  if (hasError) {
    console.error("");
    console.error("❌ Compilation failed.");
    process.exit(1);
  }
}

const contracts = output.contracts?.[sourceName];

if (!contracts) {
  console.error("❌ ERROR: No contracts were produced.");
  process.exit(1);
}

const contract = contracts[contractName];

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
 * Create artifacts directory.
 */
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, {
    recursive: true,
  });
}

/*
 * Extract bytecode safely.
 */
const creationBytecode =
  contract.evm?.bytecode?.object || "";

const deployedBytecode =
  contract.evm?.deployedBytecode?.object || "";

/*
 * Complete deployment + verification artifact.
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

  metadata: contract.metadata || null,
};

/*
 * Save complete artifact.
 */
const artifactPath = path.join(
  artifactDir,
  "IOPnToken.json"
);

fs.writeFileSync(
  artifactPath,
  JSON.stringify(artifact, null, 2)
);

/*
 * Save Standard JSON Input separately.
 *
 * This is the file we will send to Blockscout/IOPn
 * during automatic verification.
 */
const verificationInputPath = path.join(
  artifactDir,
  "IOPnToken-standard-input.json"
);

fs.writeFileSync(
  verificationInputPath,
  JSON.stringify(
    compilerInput,
    null,
    2
  )
);

/*
 * Save compiler information separately.
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

  generatedAt: new Date().toISOString(),
};

const metadataPath = path.join(
  artifactDir,
  "IOPnToken-verification.json"
);

fs.writeFileSync(
  metadataPath,
  JSON.stringify(
    verificationMetadata,
    null,
    2
  )
);

console.log("======================================");
console.log("✅ IOPnToken compiled successfully");
console.log("======================================");
console.log("");

console.log("📋 Verification configuration:");
console.log(`Contract:          ${contractName}`);
console.log(`Source:            ${sourceName}`);
console.log(`Compiler:          ${compilerVersion}`);
console.log(`Optimization:      ${optimizerEnabled}`);
console.log(`Optimization runs: ${optimizerRuns}`);
console.log(`EVM version:       ${evmVersion}`);
console.log("");

console.log("📦 Generated files:");
console.log(`   ${artifactPath}`);
console.log(`   ${verificationInputPath}`);
console.log(`   ${metadataPath}`);
console.log("");

console.log(
  `📏 Creation bytecode: ${creationBytecode.length / 2} bytes`
);

console.log(
  `📏 Deployed bytecode: ${deployedBytecode.length / 2} bytes`
);

console.log("");
console.log(
  "🚀 Compilation artifact ready for automatic verification."
);
