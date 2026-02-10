const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  const WETH_ADDR = hre.ethers.getAddress("0xc02aaa39b223fe8d0a0e5d4e34b8178521b0d801");

  // ── Mainnet addresses (already on-chain) ──
  const DXN    = "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F";
  const XEN    = "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8";
  const DBXEN  = "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD";
  const ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const WETH   = "0xC02aaA39b223FE8D0A0e5d4e34B8178521B0d801";

  console.log("\n── Deploying GOLD Token ──");
  const GoldFactory = await hre.ethers.getContractFactory("GOLDToken");
  const gold = await GoldFactory.deploy(deployer.address);
  await gold.waitForDeployment();
  const goldAddr = await gold.getAddress();
  console.log("GOLD:", goldAddr);

  console.log("\n── Deploying DXNForge ──");
  const ForgeFactory = await hre.ethers.getContractFactory("DXNForge");
  const forge = await ForgeFactory.deploy(DXN, goldAddr, DBXEN, ROUTER, WETH_ADDR, deployer.address);
  await forge.waitForDeployment();
  const forgeAddr = await forge.getAddress();
  console.log("DXNForge:", forgeAddr);

  console.log("\n── Deploying XenBurner ──");
  const BurnerFactory = await hre.ethers.getContractFactory("XenBurner");
  const burner = await BurnerFactory.deploy(XEN, forgeAddr, deployer.address);
  await burner.waitForDeployment();
  const burnerAddr = await burner.getAddress();
  console.log("XenBurner:", burnerAddr);

  console.log("\n── Wiring contracts ──");
  let tx;
  tx = await gold.setForge(forgeAddr);
  await tx.wait();
  console.log("gold.setForge ✅");

  tx = await forge.setXenBurner(burnerAddr);
  await tx.wait();
  console.log("forge.setXenBurner ✅");

  console.log("\n══════════════════════════════════");
  console.log("  MAINNET FORK DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════");
  console.log("GOLD:      ", goldAddr);
  console.log("DXNForge:  ", forgeAddr);
  console.log("XenBurner: ", burnerAddr);
  console.log("──────────────────────────────────");
  console.log("DXN:       ", DXN);
  console.log("XEN:       ", XEN);
  console.log("DBXen:     ", DBXEN);
  console.log("Router:    ", ROUTER);
  console.log("WETH:      ", WETH);
  console.log("Owner:     ", deployer.address);
  console.log("══════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
