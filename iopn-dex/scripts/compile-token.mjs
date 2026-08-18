import fs from "fs";
import path from "path";
import solc from "solc";

const contractPath = path.resolve("contracts/IOPnToken.sol");

if (!fs.existsSync(contractPath)) {
  console.error("ERROR: contracts/IOPnToken.sol does not exist.");
  process.exit(1);
}

const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "IOPnToken.sol": {
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
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
      },
    },
  },
};

const output = JSON.parse(
  solc.compile(JSON.stringify(input))
);

if (output.errors) {
  for (const error of output.errors) {
    console.log(error.formattedMessage);
  }

  const hasError = output.errors.some(
    (error) => error.severity === "error"
  );

  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts["IOPnToken.sol"]["IOPnToken"];

if (!contract) {
  console.error("ERROR: IOPnToken contract was not found.");
  process.exit(1);
}

const artifactDir = path.resolve("artifacts");

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const artifact = {
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
  deployedBytecode: contract.evm.deployedBytecode.object,
};

fs.writeFileSync(
  path.join(artifactDir, "IOPnToken.json"),
  JSON.stringify(artifact, null, 2)
);

console.log("✅ IOPnToken compiled successfully.");
console.log("📦 Artifact: artifacts/IOPnToken.json");
console.log(`🔢 Bytecode size: ${artifact.bytecode.length / 2} bytes`);
