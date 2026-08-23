import fs from "fs";
import path from "path";
import solc from "solc";

const ROOT = process.cwd();

const contractPath = path.resolve(ROOT, "contracts/IOPnToken.sol");
const artifactDir = path.resolve(ROOT, "artifacts");
const publicArtifactDir = path.resolve(ROOT, "public/artifacts");

const contractName = "IOPnToken";
const sourceName = "IOPnToken.sol";

const source = fs.readFileSync(contractPath, "utf8");

const compilerInput = {
  language: "Solidity",
  sources: {
    [sourceName]: {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
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

console.log("");
console.log("Compiling IOPnToken...");
console.log("Source:", contractPath);
console.log("Compiler:", solc.version());
console.log("Optimizer: true");
console.log("Optimization runs: 200");
console.log("EVM version: compiler default");
console.log("");

let output: any;

try {
  output = JSON.parse(
    solc.compile(JSON.stringify(compilerInput))
  );
} catch (error) {
  console.error("ERROR: solc compilation crashed.");
  console.error(error);
  process.exit(1);
}

if (output.errors) {
  for (const error of output.errors) {
    if (error.severity === "error") {
      console.error(error.formattedMessage || error.message);
    } else {
      console.warn(error.formattedMessage || error.message);
    }
  }

  const hasError = output.errors.some(
    (error: any) => error.severity === "error"
  );

  if (hasError) {
    console.error("");
    console.error("Compilation failed.");
    process.exit(1);
  }
}

const contract = output.contracts?.[sourceName]?.[contractName];

if (!contract) {
  console.error("ERROR: IOPnToken contract was not produced.");
  process.exit(1);
}

const creationBytecode = contract.evm?.bytecode?.object || "";
const deployedBytecode =
  contract.evm?.deployedBytecode?.object || "";

if (!creationBytecode || !deployedBytecode) {
  console.error("ERROR: Bytecode is empty.");
  process.exit(1);
}

fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(publicArtifactDir, { recursive: true });

const compilerVersion = solc.version();

const artifact = {
  contractName,
  sourceName,
  compiler: {
    name: "solc",
    version: `v${compilerVersion}`,
    fullVersion: compilerVersion,
  },
  optimization: {
    enabled: true,
    runs: 200,
  },
  sourceCode: source,
  compilerInput,
  abi: contract.abi,
  bytecode: creationBytecode,
  deployedBytecode,
  metadata: contract.metadata || null,
};

const verification = {
  contractName,
  sourceName,
  compiler: {
    name: "solc",
    version: `v${compilerVersion}`,
    fullVersion: compilerVersion,
  },
  optimization: {
    enabled: true,
    runs: 200,
  },
  generatedAt: new Date().toISOString(),
};

const artifactPath = path.join(
  artifactDir,
  "IOPnToken.json"
);

const standardInputPath = path.join(
  artifactDir,
  "IOPnToken-standard-input.json"
);

const verificationPath = path.join(
  artifactDir,
  "IOPnToken-verification.json"
);

fs.writeFileSync(
  artifactPath,
  JSON.stringify(artifact, null, 2)
);

fs.writeFileSync(
  standardInputPath,
  JSON.stringify(compilerInput, null, 2)
);

fs.writeFileSync(
  verificationPath,
  JSON.stringify(verification, null, 2)
);

fs.copyFileSync(
  artifactPath,
  path.join(publicArtifactDir, "IOPnToken.json")
);

fs.copyFileSync(
  standardInputPath,
  path.join(
    publicArtifactDir,
    "IOPnToken-standard-input.json"
  )
);

fs.copyFileSync(
  verificationPath,
  path.join(
    publicArtifactDir,
    "IOPnToken-verification.json"
  )
);

console.log("");
console.log("====================================");
console.log("IOPnToken compiled successfully");
console.log("====================================");
console.log("");
console.log("Compiler:", compilerVersion);
console.log("Creation bytecode:", creationBytecode.length / 2, "bytes");
console.log("Deployed bytecode:", deployedBytecode.length / 2, "bytes");
console.log("");
console.log("Generated:");
console.log(artifactPath);
console.log(standardInputPath);
console.log(verificationPath);
console.log("");
