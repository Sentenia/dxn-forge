# DXN Forge Litepaper

**Version 1.0 | January 2026**

---

## Abstract

DXN Forge is a next-generation DeFi protocol that enhances the DBXen ecosystem through pooled DXN staking, dynamic ticket-based rewards, and a dual-token economy. By introducing GOLD tokens and long-term staking mechanisms, DXN Forge creates sustainable value accrual for committed participants while maintaining composability with the broader DBXen infrastructure.

---

## 1. Introduction

### 1.1 Background

DBXen pioneered the concept of batch-minting XEN tokens with built-in fee distribution mechanisms. While revolutionary, DBXen's design centers on individual batch burning and immediate fee claims. DXN Forge extends this model by introducing:

- **Pooled Staking:** Aggregate DXN holdings for enhanced capital efficiency
- **Ticket System:** Fair, transparent reward distribution based on stake duration and amount
- **GOLD Token:** Secondary reward layer with its own staking mechanics
- **Long-Term Commitment:** Multi-year lock periods with amplified rewards

### 1.2 Design Philosophy

DXN Forge operates on three core principles:

1. **Composability:** Build on DBXen's proven infrastructure rather than competing
2. **Fairness:** Time-weighted rewards prevent whale dominance
3. **Sustainability:** Multi-layer fee flows ensure long-term protocol health

---

## 2. Protocol Architecture

### 2.1 Core Components

#### DXN Staking Pool
Users stake DXN tokens to earn:
- **Tickets:** Earned each epoch (epoch ends when Buy & Burn is triggered, 1 epoch could be mulitple DBXen 24hr cycles)
- **Bonus Multipliers:** Epochs 1-25 provide bonuses, starting at 10x ticket allocation for early stakers on Epoch 1, then decreases each epoch thereafter.
- **Epoch 26:** All staked DXN receives standard 1x multiplier to ticket allocation forever.

#### GOLD Token
- **Minting:** Distributed pro-rata to ticket holders from 8.88% buy & burn bucket
- **Auto-Staking:** All GOLD is automatically staked upon receipt
- **ETH Rewards:** Staked GOLD earns from 88%% of protocol ETH fees

#### XEN Burning
- **Direct Participation:** Burn XEN in 2.5M batches (1-10,000 batches per transaction)
- **Ticket Rewards:** Linear scale: 10,000 batches = 1 ticket
- **Fee Discounts:** Up to 50% protocol fee reduction for bulk burns (max burn batch)

### 2.2 Fee Distribution

**Protocol ETH Flows:**
```
100% Protocol Fees
├─ 8.88% → DXN Buy & Burn → Mint GOLD (tickets distribution)
├─ 3.12% → Long-Term Staking Bucket (split 50/50 for DXN/GOLD staked)
└─ 88.00% → GOLD Stakers (claimable ETH)
```

**Ticket-Based GOLD Distribution:**
- All ticket holders (DXN stakers + XEN burners) are allocated GOLD each epcoh from the 8.88% Buy & Burn, minting GOLD 1:1
- GOLD distributed proportionally to ticket count
- Auto-staked immediately upon minting and earns ETH

---

## 3. Tokenomics

### 3.1 DXN Token

**Utility:**
- Primary staking asset
- Earns tickets for GOLD distribution (when staked in DXN FORGE)
- Bonus multipliers during Epochs 1-25
- Can be locked long-term (1000-5000 days) for amplified rewards

**Supply:** Inherited from DBXen ecosystem

### 3.2 GOLD Token

**Utility:**
- Rewards token minted from 8.88% buy & burn
- Auto-stakes for ETH fee participation
- Tradeable (subject to DBXen lock+1 unstaking rules)
- Lockable for long-term staking (1000-5000 days)

**Supply:** GOLD can only be minted when DXN is burned, Every GOLD represents one DXN permanently removed

**Lock+1 Rule (DBXen Standard):**
- Manually staked GOLD locks until the next cycle completes
- Doesn't earn ETH rewards until the next cycle begins
- Applies to manual staking only (auto-staked GOLD from tickets is immediately liquid and earns ETH)

---

## 4. Staking Mechanisms

### 4.1 Standard DXN Staking

**Epochs 1-25: Lock Period with Bonuses**
- Staked DXN is locked and cannot be unstaked
- Ticket multipliers scale from 10x (Epoch 1) to 1x (Epoch 25)
- Example: Staking DXN in Epoch 1 earns 10x more tickets, staking at Epoch 12 earns ~ 5x more tickets

**Epoch 26+: Flexible Staking**
- All staked DXN unlocks
- Tickets earned at 1x rate (no bonus)
- Stake/unstake freely at any time

### 4.2 Long-Term Staking (LTS)

**Deposit Window:**
- Open: Epochs 26-51
- Closed: After Epoch 51 (permanent)

**Lock Tiers:**
| Duration | Weight | Share of LTS Bucket |
|----------|--------|---------------------|
| 1000 days | 1x | 5% |
| 2000 days | 2x | 10% |
| 3000 days | 3x | 15% |
| 4000 days | 4x | 20% |
| 5000 days | 5x | 50% |

**Benefits:**
- Earns standard tickets/GOLD (normal staking benefits continue)
- PLUS exclusive access to 3.12% LTS ETH bucket
- ETH accumulates daily, claimable anytime
- Tokens locked until maturity date

**Early End Stake (EES):**
- Partial token recovery based on time completed (EES at 50% of completed stake, get 50% of your initial token back.  The rest is locked forever)
- Forfeits all accumulated ETH rewards from LTS bucket
- Use only in true emergencies
- Any remaining tokens are considered burnt/locked in the contract forever, however, you may still claim/earn ETH/tickets from your lost GOLD/DXN tokens as if they were staked normally (just unclaimable)

### 4.3 GOLD Staking

**Auto-Staking:**
- All GOLD minted from tickets is automatically staked
- Earns from 88% ETH fee bucket immediately

**Manual Staking:**
- Users can stake additional GOLD from wallet
- Subject to DBXen lock+1 rule (locks until next cycle + no rewards that cycle)

**Rewards:**
- Proportional share of 88% ETH fees
- Claimable at any time
- Compounds over time if not claimed

---

## 5. XEN Burning Mechanism

### 5.1 Batch System

**Batch Size:** 2.5 million XEN per batch

**Range:** 1-10,000 batches per transaction

**Ticket Formula:**
```
Tickets = Batches / 10,000
```

**Examples:**
- 1 batch = 0.0001 ticket
- 5,000 batches = 0.5 ticket
- 10,000 batches = 1 ticket

### 5.2 Protocol Fees

**Formula (DBXen-Compatible):**
```
GasPerBatch = 0.000012 ETH
DiscountFactor = 1 - (0.00005 × Batches)
ProtocolFee = GasPerBatch × DiscountFactor × Batches
```

**Fee Examples:**
| Batches | Protocol Fee | Discount |
|---------|--------------|----------|
| 10 | 0.00012 ETH | 0.05% |
| 1,000 | 0.0114 ETH | 5% |
| 5,000 | 0.0450 ETH | 25% |
| 10,000 | 0.0600 ETH | 50% |

### 5.3 Integration with Tickets

XEN burners receive tickets just like DXN stakers:
- Share the same GOLD distribution pool
- Contribute to protocol activity
- No lock periods (immediate liquidity)

---

## 6. Epoch System

### 6.1 Epoch Lifecycle

**Duration:** 24 hours per epoch

**Cycle Triggers:**
- Claims from DBXen protocol
- Fee distribution calculations
- Ticket tallying and GOLD minting
- Multiplier updates (Epochs 1-25)

### 6.2 Special Epochs

**Epochs 1-25: Bonus Period**
- DXN staking locked
- Escalating ticket multipliers
- Early participant rewards

**Epoch 26: The Great Unlock**
- All staked DXN becomes withdrawable
- Bonuses end, flat 1x tickets begin
- Long-term staking window opens

**Epochs 26-51: LTS Deposit Window**
- Users can commit to 1000-5000 day locks
- Window to maximize long-term rewards
- Closes forever after Epoch 51

**Epoch 52+: Mature Protocol**
- Standard staking continues
- LTS positions locked until maturity
- Sustainable equilibrium state

---

## 7. Value Accrual

### 7.1 For DXN Holders

**Immediate:**
- Ticket earnings (GOLD distribution rights)
- Bonus multipliers (Epochs 1-25)
- Flexibility post-Epoch 26

**Long-Term:**
- Exclusive LTS ETH bucket access
- Amplified rewards via tier weights
- No cap on LTS deposits per user

### 7.2 For GOLD Holders

**Direct:**
- 88% of protocol ETH fees
- Auto-staking (no action required)
- Compounding rewards

**Indirect:**
- Tradeable asset (liquidity potential)
- Potential appreciation as protocol grows
- Stackable with LTS benefits

### 7.3 Protocol Growth Drivers

1. **DBXen Fee Generation:** Primary ETH source
2. **XEN Burning Activity:** Direct protocol fees
3. **Future Integrations:** LTS bucket has unlimited upside
4. **Network Effects:** More stakers → more tickets → more GOLD → more stakers

---

## 8. Security Considerations

### 8.1 Smart Contract Design

**Principles:**
- Minimal external dependencies
- Immutable core logic post-deployment
- Transparent fee calculations
- No admin keys for fund withdrawal

**Audits:**
- [Audit status and firms to be announced]

### 8.2 Economic Security

**Sybil Resistance:**
- Time-weighted tickets prevent flash-loan attacks
- Lock periods ensure long-term alignment

**Oracle Independence:**
- No price oracle dependencies
- Chainlink VRF for randomness (if applicable)
- On-chain verifiable calculations

### 8.3 User Protection

**Transparency:**
- All contract addresses published
- Open-source code on GitHub
- Community-verifiable deployments

**Risk Disclosure:**
- LTS locks are irreversible (except EES)
- Smart contract risk inherent to DeFi
- "Not your keys, not your crypto" applies

---

## 9. Governance

### 9.1 Initial Phase

**Launch Parameters:**
- Fixed by deployment
- No governance token
- Immutable core mechanics

### 9.2 Community Input

**Channels:**
- Telegram community discussion
- GitHub issues and proposals
- Twitter feedback

**Scope:**
- Future feature suggestions
- Integration partnerships
- Educational content

### 9.3 Protocol Evolution

**Potential Upgrades:**
- Additional LTS bucket sources
- Cross-chain deployments
- Integration with other DeFi protocols

**Note:** Any upgrades requiring contract changes will be new deployments with opt-in migration.

---

## 10. Roadmap

### Q1 2026: Genesis
- ✅ Smart contract development
- ✅ Frontend interface (claude.ai collaboration)
- ⏳ Security audits
- ⏳ Testnet deployment

### Q2 2026: Launch
- Mainnet deployment
- Epochs 1-25 bonus period begins
- Community building and onboarding
- Documentation and guides

### Q3 2026: Growth
- Epoch 26 unlock event
- LTS deposit window opens (Epochs 26-51)
- Partnerships and integrations
- Analytics dashboard

### Q4 2026: Maturity
- LTS window closes (post-Epoch 51)
- Protocol enters steady-state
- Focus on sustainability and composability
- Explore additional revenue streams for LTS bucket

### 2027+: Long-Term Vision
- Multi-year LTS positions begin maturing
- Cross-protocol integrations
- Potential L2 deployments
- Community-driven evolution

---

## 11. Technical Specifications

### 11.1 Smart Contracts

**Core Contracts:**
- `DXNForge.sol` - Main staking and ticket logic
- `GoldToken.sol` - ERC-20 GOLD with auto-staking
- `LongTermStaking.sol` - Multi-tier lock system
- `XENBurner.sol` - Batch burning interface

**Key Functions:**
```solidity
// DXN Staking
function stake(uint256 amount) external;
function unstake(uint256 amount) external;
function claimGold() external;

// GOLD Staking  
function stakeGold(uint256 amount) external;
function unstakeGold(uint256 amount) external;
function claimETH() external;

// XEN Burning
function burnXEN(uint256 batches) external payable;

// Long-Term Staking
function lockTokens(uint256 amount, uint256 tier) external;
function claimLTSRewards() external;
function emergencyEndStake(uint256 stakeId) external;
```

### 11.2 Data Structures

**User State:**
```solidity
struct UserInfo {
    uint256 dxnStaked;
    uint256 goldStaked;
    uint256 goldAutoStaked;
    uint256 ticketsEarned;
    uint256 lastClaimEpoch;
    uint256 stakedAtEpoch;
}
```

**LTS Stake:**
```solidity
struct LTSStake {
    uint256 amount;
    uint256 tier; // 1000, 2000, 3000, 4000, or 5000 days
    uint256 startTime;
    uint256 unlockTime;
    uint256 pendingETH;
    bool withdrawn;
}
```

### 11.3 Events

```solidity
event Staked(address indexed user, uint256 amount, uint256 epoch);
event Unstaked(address indexed user, uint256 amount);
event GoldMinted(address indexed user, uint256 amount);
event ETHClaimed(address indexed user, uint256 amount);
event XENBurned(address indexed user, uint256 batches, uint256 tickets);
event LTSDeposit(address indexed user, uint256 amount, uint256 tier);
event LTSWithdraw(address indexed user, uint256 amount);
```

---

## 12. Comparison with Alternatives

### 12.1 vs. DBXen Direct Staking

| Feature | DBXen | DXN Forge |
|---------|-------|-----------|
| Entry Barrier | High (individual batches) | Low (pooled staking) |
| Rewards | Direct XEN batches | Tickets → GOLD → ETH |
| Lock Periods | None | Optional (bonuses + LTS) |
| Capital Efficiency | Individual | Pooled |
| Long-Term Incentives | Limited | Multi-tier LTS |

### 12.2 vs. Traditional Staking Protocols

| Feature | Traditional | DXN Forge |
|---------|-------------|-----------|
| Reward Token | Fixed inflation | Activity-based minting |
| APY | Predictable | Variable (fee-dependent) |
| Lock Options | Single tier | 5 tiers (1000-5000 days) |
| Early Exit | Usually available | EES with penalties |
| Composability | Protocol-specific | Built on DBXen ecosystem |

---

## 13. Community & Resources

### 13.1 Official Links

- **Website:** [To be announced]
- **GitHub:** https://github.com/Sentenia/dxn-forge-cl
- **Telegram:** https://t.me/dxnforge
- **Twitter:** [To be announced]

### 13.2 Developer Resources

- **Documentation:** GitHub Wiki
- **Smart Contracts:** GitHub repository
- **Interface:** Open-source React frontend
- **APIs:** Subgraph and on-chain queries

### 13.3 Support

- **Community Support:** Telegram group
- **Technical Issues:** GitHub issues
- **General Inquiries:** Twitter DMs

---

## 14. Disclaimer

### 14.1 No Investment Advice

This litepaper is for informational purposes only and does not constitute financial, investment, legal, or tax advice. DXN Forge is an experimental DeFi protocol with inherent risks.

### 14.2 Risk Factors

- **Smart Contract Risk:** Bugs or exploits could result in loss of funds
- **Market Risk:** Token prices are volatile and may go to zero
- **Regulatory Risk:** DeFi regulations are evolving and uncertain
- **Long-Term Lock Risk:** LTS commitments are irreversible (except EES)
- **Protocol Risk:** DBXen dependencies introduce systemic risk

### 14.3 Use at Your Own Risk

Users are responsible for their own due diligence. Always:
- Verify all transactions before signing
- Never invest more than you can afford to lose
- Understand the mechanics before participating
- Keep your private keys secure

### 14.4 No Affiliation

DXN Forge is a community-built project and is **not affiliated with the original DBXen team**. This is an independent protocol that builds on the DBXen ecosystem.

---

## 15. Conclusion

DXN Forge represents a natural evolution of the DBXen ecosystem, introducing pooled staking, fair ticket-based rewards, and long-term commitment mechanisms. By layering GOLD token economics atop DXN staking and enabling multi-year lock periods with amplified rewards, DXN Forge creates a sustainable value accrual system for patient capital.

The protocol's design prioritizes:
- **Fairness:** Time-weighted rewards prevent manipulation
- **Composability:** Builds on DBXen's proven infrastructure  
- **Sustainability:** Multi-layer fee flows ensure longevity
- **Flexibility:** Multiple participation options (standard staking, LTS, XEN burning)

As the protocol matures through its epoch system, early participants benefit from bonus multipliers, while long-term stakers gain access to exclusive reward buckets. The combination of immediate liquidity (post-Epoch 26 DXN, auto-staked GOLD) and optional long-term locks (LTS) caters to diverse risk appetites and time preferences.

**DXN Forge:** Where patience is rewarded, and commitment compounds.

---

**Version History:**
- v1.0 (January 2026): Initial release

**Last Updated:** January 27, 2026

---

*This litepaper is a living document and may be updated as the protocol evolves.*
