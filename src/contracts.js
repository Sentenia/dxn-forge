// Deployed Sepolia Contracts
export const CONTRACTS = {
  tDXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
  tXEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
  TestDXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
  TestXEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
  MockDBXEN: '0x372c37e55F81E43Abb0E9c98CD37f1DD2969A366',
  GOLDToken: '0x6106Bf468C15D999b7dE22e458A41E77a3FaDdDf',
  DXNForge: '0xE456171CE6e49118445b6550ca195BED91d46231',
  XenBurner: '0xF7e8df4128360231AAf0e35b31eeBFAc0C6Bd1cd',
  DXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
  GOLD: '0x6106Bf468C15D999b7dE22e458A41E77a3FaDdDf',
  XEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
};

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function totalSupply() view returns (uint256)',
];

export const FAUCET_ABI = [
  'function claim() external',
  'function timeUntilNextClaim(address user) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function DRIP_AMOUNT() external view returns (uint256)',
];

export const MOCK_DBXEN_ABI = [
  'function currentCycle() view returns (uint256)',
  'function claimableEth() view returns (uint256)',
  'function totalStaked() view returns (uint256)',
];

export const GOLD_ABI = [
  ...ERC20_ABI,
  'function forge() view returns (address)',
];

export const FORGE_ABI = [
  // Protocol state
  'function epoch() view returns (uint256)',
  'function cycle() view returns (uint256)',
  'function forgeCycle() view returns (uint256)',
  'function startCycle() view returns (uint256)',
  'function totWt() view returns (uint256)',
  'function totEligGold() view returns (uint256)',
  'function mult() view returns (uint256)',
  'function bonusOn() view returns (bool)',
  'function pendingBurn() view returns (uint256)',
  'function pendingLts() view returns (uint256)',
  'function allocLts() view returns (uint256)',
  'function totEthDist() view returns (uint256)',
  'function dxnPending() view returns (uint256)',
  'function dxnStaked() view returns (uint256)',
  'function totAutoGold() view returns (uint256)',
  'function manualPending() view returns (uint256)',
  'function manualStaked() view returns (uint256)',
  'function tixEpoch() view returns (uint256)',
  'function stakerTixEpoch() view returns (uint256)',
  'function canFee() view returns (bool)',
  'function lastFeeTime() view returns (uint256)',
  'function epTix(uint256) view returns (uint256)',
  'function epGold(uint256) view returns (uint256)',
  'function epDone(uint256) view returns (bool)',
  'function sync() external',

  // User state
  'function userDXN(address) view returns (uint256 pending, uint256 staked, uint256 unlock)',
  'function manualGold(address) view returns (uint256 pending, uint256 staked, uint256 earnCy, uint256 unlockCy, bool counted)',
  'function autoGold(address) view returns (uint256)',
  'function userWt(address) view returns (uint256)',
  'function userEligGold(address) view returns (uint256)',
  'function pendEth(address) view returns (uint256)',
  'function pendTix(address) view returns (uint256)',
  'function userTix(address) view returns (uint256)',

  // Core write functions
  'function stakeDXN(uint256 amount)',
  'function unstakeDXN(uint256 amount)',
  'function stakeGold(uint256 amount)',
  'function unstakeGold(uint256 amount)',
  'function claimRewards()',
  'function claimEth()',
  'function claimFees()',
  'function buyAndBurn(uint256 amount, uint256 minOut)',

  // Crucible Constants
  'function WINDOW_LEN() view returns (uint256)',
  'function TIER_DAYS(uint256) view returns (uint256)',
  'function TIER_WT(uint256) view returns (uint256)',
  'function TOT_WT() view returns (uint256)',
  'function CLAIM_WIN() view returns (uint256)',

  // Crucible State
  'function crucible() view returns (uint256)',
  'function crucibles(uint256) view returns (uint256 start, uint256 end, uint256 lock)',
  'function snaps(uint256 crucibleId, uint8 tier) view returns (uint256 dxnAlloc, uint256 goldAlloc, uint256 dxnClaimed, uint256 goldClaimed, uint256 rolled, bool taken)',
  'function pos(uint256 tokenId) view returns (uint256 cru, address asset, uint8 tier, uint256 amt, uint256 lock, bool claimed)',
  'function ltsLockedDXN(address, uint256) view returns (uint256)',
  'function ltsLockedGold(address, uint256) view returns (uint256)',
  'function userLtsDXN(address) view returns (uint256)',
  'function userLtsGold(address) view returns (uint256)',
  'function globalLtsDXN() view returns (uint256)',
  'function globalLtsGold() view returns (uint256)',

  // Crucible Views
  'function windowOpen(uint256) view returns (bool)',
  'function tierMature(uint256 crucibleId, uint8 tier) view returns (uint256)',
  'function isMature(uint256 crucibleId, uint8 tier) view returns (bool)',
  'function deadline(uint256 crucibleId, uint8 tier) view returns (uint256)',
  'function nftMature(uint256 tokenId) view returns (bool)',
  'function ethShare(uint256 tokenId) view returns (uint256)',
  'function canStartNew() view returns (bool)',
  'function getPending(address, uint256) view returns (uint256[5] dxn, uint256[5] gold, bool minted)',
  'function getTotals(uint256) view returns (uint256[5] dxn, uint256[5] gold)',

  // Crucible Write
  'function addDXN(uint256 amount, uint8 tier)',
  'function addGOLD(uint256 amount, uint8 tier)',
  'function mintNFTs(uint256 crucibleId)',
  'function claim(uint256 tokenId)',
  'function startNew()',

  // ERC721
  'function balanceOf(address) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function approve(address, uint256)',
  'function transferFrom(address, address, uint256)',
  'function safeTransferFrom(address, address, uint256)',

  // Events for NFT indexing
  'event CruMint(address indexed user, uint256 indexed crucibleId, uint256 tokenId, address asset, uint8 tier, uint256 amt)',
  'event CruClaim(address indexed user, uint256 indexed crucibleId, uint256 tokenId, address asset, uint256 amt, uint256 eth)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',

  // Admin (testnet)
  'function setBonus(bool)',
  'function advanceEpoch(uint256)',
  'function resetFeeTimer()',
];

export const XENBURNER_ABI = [
  'function burnXEN(uint256 batches) payable',
  'function calcFee(uint256 batches) view returns (uint256 fee, uint256 disc)',
  'function xenBurned() view returns (uint256)',
  'function xenFees() view returns (uint256)',
  'function userXenBurned(address) view returns (uint256)',
  'function XEN_BATCH() view returns (uint256)',
  'function BASE_FEE() view returns (uint256)',
  'function BATCH_TIX() view returns (uint256)',
  'function realBurn() view returns (bool)',
];

export const DEPLOY_BLOCK = 10180000;

import { ethers } from 'ethers';

const sepoliaNetwork = ethers.Network.from(11155111);

export function getReadProvider() {
  const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;

  const primary = alchemyKey
    ? new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`, sepoliaNetwork, { staticNetwork: true })
    : null;

  const backup = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', sepoliaNetwork, { staticNetwork: true });

  return primary || backup;
}