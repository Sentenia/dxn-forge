const hre = require("hardhat");

async function main() {
  const DXN = "0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F";
  const you = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const whale = hre.ethers.getAddress("0x69d6f400ddd5ad71972e6b5ba7e3c1ed96154f1c");

  await hre.network.provider.request({ method: "hardhat_impersonateAccount", params: [whale] });

  const [deployer] = await hre.ethers.getSigners();
  await deployer.sendTransaction({ to: whale, value: hre.ethers.parseEther("1") });

  const signer = await hre.ethers.getSigner(whale);
  const dxn = new hre.ethers.Contract(DXN, [
    "function transfer(address,uint256) returns (bool)",
    "function balanceOf(address) view returns (uint256)"
  ], signer);

  const bal = await dxn.balanceOf(whale);
  console.log("Whale DXN:", hre.ethers.formatEther(bal));
  await dxn.transfer(you, hre.ethers.parseEther("1000"));
  console.log("Your DXN:", hre.ethers.formatEther(await dxn.balanceOf(you)));
}

main();