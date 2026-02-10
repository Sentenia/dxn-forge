const hre = require("hardhat");

async function main() {
  const forge = new hre.ethers.Contract(
    "0x56d4d6aEe0278c5Df2FA23Ecb32eC146C9446FDf",
    [
      "function cycle() view returns (uint256)",
      "function forgeCycle() view returns (uint256)",
      "function startCycle() view returns (uint256)",
      "function epoch() view returns (uint256)",
    ],
    (await hre.ethers.getSigners())[0]
  );

  console.log("cycle:", (await forge.cycle()).toString());
  console.log("forgeCycle:", (await forge.forgeCycle()).toString());
  console.log("startCycle:", (await forge.startCycle()).toString());
  console.log("epoch:", (await forge.epoch()).toString());
}

main();