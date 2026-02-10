# DXNForge

**Built, not farmed. Scarcity forged in fire.**

DXNForge is a DeFi protocol on Ethereum that wraps DBXen staking with automated buy-and-burn mechanics and long-term staking rewards. Stake DXN, earn GOLD, burn XEN — all in one place.

## How It Works

- **Stake DXN** → Earn tickets every cycle based on your weight in the pool
- **Buy & Burn** → Protocol fees buy DXN on Uniswap, burn it, and mint GOLD 1:1
- **Earn GOLD** → Tickets from each epoch determine your share of minted GOLD
- **Stake GOLD** → Earn 88% of protocol fees as ETH
- **Burn XEN** → Burn XEN batches for bonus tickets via XenBurner
- **Long-Term Stake (LTS)** → Lock DXN or GOLD in Crucibles for 1000-5000 days, earn ETH from the LTS fee bucket, receive an NFT position

## Fee Distribution

| Share | Destination |
|-------|------------|
| 88.00% | GOLD stakers (ETH) |
| 8.88% | Buy & burn DXN → mint GOLD |
| 3.12% | LTS bucket (weighted across 5 tiers) |

## Contracts

| Contract | Description |
|----------|------------|
| **DXNForge** | Core protocol — staking, rewards, tickets, LTS, Crucible NFTs |
| **GOLDToken** | ERC20 — minted 1:1 with DXN burned |
| **XenBurner** | Burns XEN in batches, credits tickets on Forge |

## Security

See [SECURITY.md](./SECURITY.md) for full audit reports, OWASP Smart Contract Top 10 compliance, and trust model.

**Key points:**
- ✅ Zero admin keys — all ownership renounced after deployment
- ✅ Fully immutable — no upgrades, no proxy, no pause
- ✅ Open source — all contracts verified on Etherscan

## Tech Stack

- **Contracts**: Solidity 0.8.20, OpenZeppelin v5, Foundry
- **Frontend**: React, ethers.js, Reown AppKit
- **Integrations**: DBXen, Uniswap V3, XEN

## Development

```shell
# Build
forge build

# Test
forge test

# Local fork
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

## License

MIT