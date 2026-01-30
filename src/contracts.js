// Deployed Sepolia Test Token Contracts
export const SEPOLIA_CONTRACTS = {
  TestDXN: '0x04629d7cEf05fe31250513e875C1Ee6B751946C4',
  TestXEN: '0xf7735BbF9b5623D2b5E242829263aaCAC17dA865',
  
  // Alchemy Sepolia ETH faucet
  SepoliaETHFaucet: 'https://www.alchemy.com/faucets/ethereum-sepolia'
};

// Minimal ABI for faucet functions
export const FAUCET_ABI = [
  'function claim() external',
  'function timeUntilNextClaim(address user) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function DRIP_AMOUNT() external view returns (uint256)',
  'event Claimed(address indexed user, uint256 amount)'
];

// Etherscan links
export const ETHERSCAN_LINKS = {
  TestDXN: 'https://sepolia.etherscan.io/address/0x04629d7cef05fe31250513e875c1ee6b751946c4',
  TestXEN: 'https://sepolia.etherscan.io/address/0xf7735bbf9b5623d2b5e242829263aacac17da865'
};