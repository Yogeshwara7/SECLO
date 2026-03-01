import { ethers } from "hardhat";

async function main() {
  console.log("=== Deploying to Virtual TestNet ===");
  console.log("Network: Hoodi Virtual TestNet");
  console.log("");

  // Check if private key is configured
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.error("❌ Error: DEPLOYER_PRIVATE_KEY not set in .env file");
    console.error("Please add your private key to the .env file in the project root");
    process.exit(1);
  }

  const signers = await ethers.getSigners();
  
  if (!signers || signers.length === 0) {
    console.error("❌ Error: No signers available");
    console.error("Make sure your private key is valid and has 0x prefix");
    process.exit(1);
  }

  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Error: Deployer account has 0 ETH");
    console.error("Please fund this address on the Virtual TestNet:");
    console.error("https://dashboard.tenderly.co/Yogii/seclo-payroll/testnet/d64b1e54-82a9-4585-88e7-907472ab96f2");
    process.exit(1);
  }
  
  console.log("");

  // Deploy MockSCLO
  console.log("1. Deploying MockSCLO token...");
  const MockSCLO = await ethers.getContractFactory("MockSCLO");
  const sclo = await MockSCLO.deploy();
  await sclo.waitForDeployment();
  const scloAddress = await sclo.getAddress();
  console.log("✅ MockSCLO deployed to:", scloAddress);
  console.log("");

  // Deploy PayrollConsumer
  console.log("2. Deploying PayrollConsumer...");
  const forwarderAddress = "0x15fc6ae953e024d975e77382eeec56a9101f9f88";
  const PayrollConsumer = await ethers.getContractFactory("PayrollConsumer");
  const consumer = await PayrollConsumer.deploy(forwarderAddress, scloAddress);
  await consumer.waitForDeployment();
  const consumerAddress = await consumer.getAddress();
  console.log("✅ PayrollConsumer deployed to:", consumerAddress);
  console.log("   Forwarder:", forwarderAddress);
  console.log("   SCLO Token:", scloAddress);
  console.log("");

  // Fund PayrollConsumer with SCLO
  console.log("3. Funding PayrollConsumer with SCLO...");
  const fundAmount = ethers.parseEther("100000"); // 100k SCLO
  const scloContract = await ethers.getContractAt("MockSCLO", scloAddress);
  const tx = await scloContract.transfer(consumerAddress, fundAmount);
  await tx.wait();
  console.log("✅ Transferred 100,000 SCLO to PayrollConsumer");
  console.log("");

  // Verify balance
  console.log("4. Verifying balance...");
  const consumerContract = await ethers.getContractAt("PayrollConsumer", consumerAddress);
  const balance2 = await consumerContract.getBalance();
  console.log("✅ PayrollConsumer balance:", ethers.formatEther(balance2), "SCLO");
  console.log("");

  console.log("=== Deployment Complete ===");
  console.log("");
  console.log("📝 Update your .env files with these addresses:");
  console.log("");
  console.log("backend/.env:");
  console.log(`PAYROLL_CONSUMER_ADDRESS=${consumerAddress}`);
  console.log(`SCLO_TOKEN_ADDRESS=${scloAddress}`);
  console.log("");
  console.log("frontend/.env:");
  console.log(`VITE_PAYROLL_CONSUMER_ADDRESS=${consumerAddress}`);
  console.log(`VITE_SCLO_TOKEN_ADDRESS=${scloAddress}`);
  console.log("");
  console.log("🔗 View in Tenderly:");
  console.log("https://dashboard.tenderly.co/Yogii/seclo-payroll/testnet/d64b1e54-82a9-4585-88e7-907472ab96f2");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
