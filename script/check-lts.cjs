const hre = require("hardhat");

async function main() {
  const forge = new hre.ethers.Contract(
    "0x56d4d6aEe0278c5Df2FA23Ecb32eC146C9446FDf",
    [
      "function crucibles(uint256) view returns (uint256 start, uint256 end, uint256 lock)",
      "function forgeCycle() view returns (uint256)",
    ],
    (await hre.ethers.getSigners())[0]
  );

  const c = await forge.crucibles(1);
  console.log("start:", c.start.toString());
  console.log("end:", c.end.toString());
  console.log("lock:", c.lock.toString());
  console.log("forgeCycle:", (await forge.forgeCycle()).toString());
}

main();