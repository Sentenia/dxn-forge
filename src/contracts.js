import { ethers } from 'ethers';

// ── Network switch ──
export const NETWORK = import.meta.env.VITE_NETWORK || 'sepolia';

const ADDRESSES = {
  sepolia: {
    DXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
    XEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
    tDXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
    tXEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
    TestDXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
    TestXEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
    MockDBXEN: '0xC4994Af06784b19faB9d8b2FB3Aff96102B71B13',
    GOLDToken: '0xF86422Bdc89815893973c308a4BBDfe339496f60',
    DXNForge: '0x72a9296C523bEE37a02b0A16d4DbCfE92a14EFFA',
    XenBurner: '0x41b80129a229cCcCF689DBBd26fF11f25a65C428',
    GOLD: '0xF86422Bdc89815893973c308a4BBDfe339496f60',
  },
  'mainnet-fork': {
    DXN: '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F',
    XEN: '0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8',
    DBXen: '0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD',
    GOLDToken: '0x81dcf22C4Ee4bD8EB3BDcb042fEb2Cc824379E0C',
    DXNForge: '0x56d4d6aEe0278c5Df2FA23Ecb32eC146C9446FDf',
    XenBurner: '0x28Ed3FC0df885ab756b3aB00cd74F5DfF74c3266',
    GOLD: '0x81dcf22C4Ee4bD8EB3BDcb042fEb2Cc824379E0C',
    tDXN: '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F',
    tXEN: '0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8',
    TestDXN: '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F',
    TestXEN: '0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8',
    MockDBXEN: '0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD',
  },
  mainnet: {
    // Fill in when ready to launch
  },
};

export const CONTRACTS = ADDRESSES[NETWORK];

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

// ── MockDBXEN ABI (Sepolia only) ──
export const MOCK_DBXEN_ABI = [
  'function currentCycle() view returns (uint256)',
  'function claimableEth() view returns (uint256)',
  'function totalStaked() view returns (uint256)',
];

// ── Real DBXen ABI (mainnet / mainnet-fork) ──
// From verified contract on Etherscan: 0xF5c80c305803280B587F8cabBcCdC4d9BF522AbD
export const DBXEN_ABI = [
  // Read - Constants
  'function MAX_BPS() view returns (uint256)',
  'function SCALING_FACTOR() view returns (uint256)',
  'function XEN_BATCH_AMOUNT() view returns (uint256)',
  'function i_initialTimestamp() view returns (uint256)',
  'function i_periodDuration() view returns (uint256)',

  // Read - Cycle state
  'function currentCycle() view returns (uint256)',
  'function getCurrentCycle() view returns (uint256)',
  'function currentStartedCycle() view returns (uint256)',
  'function lastStartedCycle() view returns (uint256)',
  'function previousStartedCycle() view returns (uint256)',
  'function currentCycleReward() view returns (uint256)',
  'function lastCycleReward() view returns (uint256)',
  'function lastFeeUpdateCycle() view returns (uint256)',
  'function rewardPerCycle(uint256) view returns (uint256)',

  // Read - Fee state
  'function accAccruedFees(address) view returns (uint256)',
  'function cycleAccruedFees(uint256) view returns (uint256)',
  'function cycleFeesPerStakeSummed(uint256) view returns (uint256)',
  'function pendingFees() view returns (uint256)',
  'function totalNumberOfBatchesBurned() view returns (uint256)',
  'function cycleTotalBatchesBurned(uint256) view returns (uint256)',

  // Read - Staking state
  'function pendingStake() view returns (uint256)',
  'function pendingStakeWithdrawal() view returns (uint256)',
  'function summedCycleStakes(uint256) view returns (uint256)',
  'function accStakeCycle(address, uint256) view returns (uint256)',
  'function accFirstStake(address) view returns (uint256)',
  'function accSecondStake(address) view returns (uint256)',
  'function accWithdrawableStake(address) view returns (uint256)',
  'function accRewards(address) view returns (uint256)',
  'function accCycleBatchesBurned(address, uint256) view returns (uint256)',
  'function lastActiveCycle(address) view returns (uint256)',

  // Read - Token refs
  'function dxn() view returns (address)',
  'function xen() view returns (address)',

  // Write
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function claimFees()',
  'function claimRewards()',
  'function burnBatch(uint256 batchNumber) payable',
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
  'function getLtsBuckets() view returns (uint256[5])',

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

export const DEPLOY_BLOCK = NETWORK === 'sepolia' ? 10180000 : 0;

export function getReadProvider() {
  if (NETWORK === 'mainnet-fork') {
    return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  }

  const sepoliaNetwork = ethers.Network.from(11155111);
  const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;

  const primary = alchemyKey
    ? new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`, sepoliaNetwork, { staticNetwork: true })
    : null;

  const backup = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', sepoliaNetwork, { staticNetwork: true });

  return primary || backup;
}