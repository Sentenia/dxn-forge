# DXN Forge — Project Context

## What This Is
DXN Forge is a DeFi staking & rewards protocol on Ethereum. Users stake DXN tokens to earn GOLD tokens and ETH dividends via a ticket-based allocation system. Integrates with DBXen protocol. Currently testing on Sepolia, preparing for mainnet.

## Tech Stack
- **Contracts**: Solidity ^0.8.20, OpenZeppelin, Hardhat
- **Frontend**: React + Vite, ethers.js v6, Reown AppKit wallet modal
- **Testnet**: Sepolia

## Sepolia v9 Contract Addresses
```
tDXN     = 0x04629d7cEf05fe31250513e875C1Ee6B751946C4
tXEN     = 0xf7735BbF9b5623D2b5E242829263aaCAC17dA865
GOLD     = 0x6106Bf468C15D999b7dE22e458A41E77a3FaDdDf
MockDBXEN= 0x372c37e55F81E43Abb0E9c98CD37f1DD2969A366
Forge    = 0x85Aca6199d140d3A31fCaC7a7ea24B74bE8103E2
Router   = 0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E (Uniswap V3)
WETH     = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
```

## Contract Bugs Fixed in Latest Version
1. **XEN Discount Scaling**: `calcFee()` now uses `disc = b / 2` (50% max at 10,000 batches, was incorrectly reaching 50% at 1,000)
2. **GOLD Stakers ETH Rollover**: Removed `else { toBurn += toGold; }` from `claimFees()` — when no GOLD stakers, ETH stays in contract for next distribution
3. **MockDBXEN**: Must remove `adminResetCycleOverride()` — resetting to time-based can jump cycles backward. Only keep `adminSetCycle()` and `adminAdvanceCycles()`

## Key Design Decisions
- **DXN unstaking**: NO lock period after pending→staked transition. Bonus multiplier (10x→1x over 25 epochs) is the incentive to keep staking
- **DXN staking lock**: Stake at cycle N → earns tickets immediately → withdrawable at N+2 (matches DBXen unlock timing but earns sooner)
- **GOLD staking lock**: Stake at cycle N → earns ETH at N+1 → withdrawable at N+2 (exactly matches DBXen behavior)
- **GOLD minting**: 1:1 with DXN burned/staked, so goldTotalSupply = total DXN entered forge
- **Tickets**: `tixEpoch` resets on `buyAndBurn()`, but `userTix` persists until `_allocGold()` runs on user's next tx. Tickets from previous epoch show as "pending GOLD allocation"
- **Fee split**: 88% GOLD stakers, 8.88% buy & burn, 3.12% LTS

## Frontend Architecture
- **Wallet**: Reown AppKit (project ID: aa0b9fb53b2b8c54a3dd03332aee3f68)
- **Mobile**: Swipe navigation between 4 pages: Dashboard → LTS → Burn XEN → How It Works
- **Navigation**: Page indicator dots with left/right chevrons
- **Data**: Two-phase loading in useForgeData — essentials first (user balances, epoch/cycle), stats delayed 1s
- **Collapsible Sections**: Hero Stats and Protocol Info sections start collapsed, state saved to localStorage
- **Icons**: All icons use Lucide React — no emojis in UI components
- **Notifications**: Toast system in theme.css (`.toast-notification`) — fixed position, z-index 10000
- **Sync**: Button calls `forge.sync()` not `forge.poke()`
- **Error handling**: `src/utils/contractErrors.js` maps error selectors to user-friendly messages

## Contract Error Selectors (for reference)
```javascript
"0xf4560403" // Zero() - nothing to claim
"0x74e4ead5" // Cooldown() - 24h cooldown active
"0xbd6b1951" // WaitCycle() - must wait for next DBXen cycle
"0x12f1f923" // WindowClosed() - LTS deposit window closed
"0x5a7b3282" // WindowOpen() - LTS window still open
"0xf1154826" // AlreadyMinted() - NFTs already minted
"0x318cebaf" // NoDeposits() - no deposits to mint
"0x55ca1f58" // NotMature() - position not mature yet
```

## ethers.js v6 Gotchas
- All contract return values are BigInt — never mix with Number
- Use `ethers.formatEther()` / `ethers.parseEther()` not `utils.formatEther()`
- `provider.getBalance()` returns BigInt
- Contract calls: `await contract.functionName()` not `contract.methods.functionName().call()`

## Known Issues / TODO
- [ ] Toast notifications may not be appearing on contract errors — debug logs added, needs testing
- [ ] Verify all error selectors match actual contract errors (compute keccak256 of error signatures)

## Mainnet Checklist
- [ ] XEN discount fix deployed (critical)
- [ ] GOLD stakers ETH rollover fix deployed
- [ ] Remove `adminResetCycleOverride()` from MockDBXEN (not needed on mainnet — using real DBXen)
- [ ] Replace MockDBXEN address with real DBXen mainnet address
- [ ] Replace tDXN/tXEN with real token addresses
- [ ] Verify Uniswap V3 router address for mainnet
- [ ] Remove all admin test functions
- [ ] Audit fee distribution math
