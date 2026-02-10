// script/advance-time.cjs
async function main() {
  const days = parseInt(process.argv[2]) || 1;
  const seconds = days * 86400;
  
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
  
  console.log(`Advanced ${days} day(s) (${seconds}s)`);
  
  // Verify by reading DBXen cycle
  const dbxen = await ethers.getContractAt(
    ["function currentCycle() view returns (uint256)"],
    "0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD" // real DBXen mainnet
  );
  console.log("DBXen cycle now:", (await dbxen.currentCycle()).toString());
}

main().catch(console.error);