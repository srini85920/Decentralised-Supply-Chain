require('dotenv').config();
const hre = require('hardhat');
const fs = require('fs');
const Web3 = require('web3').default;

async function main() {
  const web3 = new Web3(hre.network.provider);
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];

  console.log("🚀 Deploying contract from:", deployer);

  const SupplyChain = await hre.artifacts.readArtifact("SupplyChain");
  const contract = new web3.eth.Contract(SupplyChain.abi);

  const deployed = await contract
    .deploy({ data: SupplyChain.bytecode })
    .send({ from: deployer, gas: 5000000 });

  console.log("✅ Contract deployed at:", deployed.options.address);

  fs.writeFileSync(
    './frontend/src/contractAddress.json',
    JSON.stringify({ address: deployed.options.address }, null, 2)
  );
}

main().catch(err => {
  console.error("❌ Deployment error:", err);
  process.exit(1);
});
