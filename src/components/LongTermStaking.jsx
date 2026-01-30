import React, { useState } from 'react';
import { 
  Lock, 
  Trophy, 
  Coins, 
  AlertTriangle, 
  Gem, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import './LongTermStaking.css';

function LongTermStaking() {
  const [selectedTier, setSelectedTier] = useState(5000);
  const [lockType, setLockType] = useState('DXN'); // 'DXN' or 'GOLD'
  const [amount, setAmount] = useState('');

  const tiers = [
    { days: 1000, weight: '1x', share: '5%' },
    { days: 2000, weight: '2x', share: '10%' },
    { days: 3000, weight: '3x', share: '15%' },
    { days: 4000, weight: '4x', share: '20%' },
    { days: 5000, weight: '5x', share: '50%' },
  ];

  const userBalances = {
    DXN: 1000,
    GOLD: 250
  };

  // Mock active positions
  const activePositions = [
    { tier: '5000d', amount: '1000 DXN', maturity: '2038-06-15', claimable: '0.45 ETH', status: 'locked' },
    { tier: '3000d', amount: '500 GOLD', maturity: '2033-01-20', claimable: '0.23 ETH', status: 'locked' },
  ];

  const handleLock = () => {
    const tierInfo = tiers.find(t => t.days === selectedTier);
    const confirmMessage = `⚠️ PERMANENT LOCK COMMITMENT ⚠️

You are about to lock ${amount} ${lockType} for ${selectedTier} days (${(selectedTier / 365).toFixed(1)} years).

CRITICAL WARNINGS:
• Once Epoch 51 closes, your tokens are PERMANENTLY LOCKED until maturity
• Standard unstaking is NOT available
• Only Emergency End Stake (EES) option exists:
  - Claim % of tokens based on time completed
  - Unclaimed tokens LOCKED FOREVER
  - You FORFEIT all ETH rewards
  - BUT you can still earn NEW ETH as position stays active
  - Your locked tokens = permanent burn with yield

Weight: ${tierInfo?.weight}
Bucket Share: ${tierInfo?.share}

Type "LOCK" to confirm you understand this is permanent.`;

    const userInput = prompt(confirmMessage);
    
    if (userInput === 'LOCK') {
      alert(`✅ Successfully locked ${amount} ${lockType} for ${selectedTier} days!\n\nYour position is now active and earning from the long-term bucket.`);
      setAmount('');
    } else if (userInput !== null) {
      alert('❌ Lock cancelled. You must type "LOCK" to confirm.');
    }
  };

  const handleClaim = (position) => {
    alert(`Mock: Claiming ${position.claimable} from ${position.tier} position`);
  };

  return (
    <div className="longterm-page">
      {/* Hero Section */}
      <div className="longterm-hero">
        <h1><Gem size={48} style={{display: 'inline', marginBottom: '-8px', marginRight: '12px'}} /> Long-Term Staking</h1>
        <p>Lock DXN or GOLD for 1000-5000 days and earn from exclusive ETH pools</p>
        <div className="window-status closed">
          <Clock size={18} style={{display: 'inline', marginRight: '6px'}} /> Deposit Window: <strong>Opens Epoch 26, Closes Epoch 51</strong>
        </div>
      </div>

      {/* Critical Warning Banner */}
      <div className="critical-warning-banner">
        <AlertTriangle size={48} className="warning-icon" />
        <div className="warning-content">
          <h3>PERMANENT LOCK COMMITMENT</h3>
          <p>
            Once the deposit window <strong>closes at Epoch 51</strong>, all staked tokens are <strong>PERMANENTLY LOCKED</strong> until their maturity date. 
            Standard unstaking is NOT possible. Only Emergency End Stake (EES) is available - see details below.
          </p>
        </div>
      </div>

      {/* Protocol Stats - Public View */}
      <div className="protocol-stats-section">
        <h3><BarChart3 size={24} style={{display: 'inline', marginRight: '8px', marginBottom: '-4px'}} /> Protocol Statistics</h3>
        
        <div className="main-stats-grid">
          <div className="stat-card total">
            <Lock size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">Total DXN Locked</div>
              <div className="stat-value">24,583</div>
              <div className="stat-sublabel">Permanently committed</div>
            </div>
          </div>

          <div className="stat-card total">
            <Trophy size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">Total GOLD Locked</div>
              <div className="stat-value">8,429</div>
              <div className="stat-sublabel">Permanently committed</div>
            </div>
          </div>

          <div className="stat-card total">
            <Coins size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">ETH Bucket Balance</div>
              <div className="stat-value highlight">12.4567 ETH</div>
              <div className="stat-sublabel">Growing daily</div>
            </div>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="tier-breakdown">
          <h4>Breakdown by Tier</h4>
          <div className="tier-stats-grid">
            {/* 1000d Tier */}
            <div className="tier-stat-card">
              <div className="tier-stat-header">
                <span className="tier-badge-stat">1000d</span>
                <span className="tier-weight-stat">1x</span>
                <span className="tier-share-stat">5%</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">DXN Locked:</span>
                <span className="tier-stat-value">2,450</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">GOLD Locked:</span>
                <span className="tier-stat-value">890</span>
              </div>
              <div className="tier-stat-row claimable">
                <span className="tier-stat-label">ETH Claimable:</span>
                <span className="tier-stat-value">0.6228 ETH</span>
              </div>
            </div>

            {/* 2000d Tier */}
            <div className="tier-stat-card">
              <div className="tier-stat-header">
                <span className="tier-badge-stat">2000d</span>
                <span className="tier-weight-stat">2x</span>
                <span className="tier-share-stat">10%</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">DXN Locked:</span>
                <span className="tier-stat-value">3,890</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">GOLD Locked:</span>
                <span className="tier-stat-value">1,240</span>
              </div>
              <div className="tier-stat-row claimable">
                <span className="tier-stat-label">ETH Claimable:</span>
                <span className="tier-stat-value">1.2457 ETH</span>
              </div>
            </div>

            {/* 3000d Tier */}
            <div className="tier-stat-card">
              <div className="tier-stat-header">
                <span className="tier-badge-stat">3000d</span>
                <span className="tier-weight-stat">3x</span>
                <span className="tier-share-stat">15%</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">DXN Locked:</span>
                <span className="tier-stat-value">5,670</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">GOLD Locked:</span>
                <span className="tier-stat-value">1,890</span>
              </div>
              <div className="tier-stat-row claimable">
                <span className="tier-stat-label">ETH Claimable:</span>
                <span className="tier-stat-value">1.8685 ETH</span>
              </div>
            </div>

            {/* 4000d Tier */}
            <div className="tier-stat-card">
              <div className="tier-stat-header">
                <span className="tier-badge-stat">4000d</span>
                <span className="tier-weight-stat">4x</span>
                <span className="tier-share-stat">20%</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">DXN Locked:</span>
                <span className="tier-stat-value">6,230</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">GOLD Locked:</span>
                <span className="tier-stat-value">2,100</span>
              </div>
              <div className="tier-stat-row claimable">
                <span className="tier-stat-label">ETH Claimable:</span>
                <span className="tier-stat-value">2.4913 ETH</span>
              </div>
            </div>

            {/* 5000d Tier */}
            <div className="tier-stat-card highlight">
              <div className="tier-stat-header">
                <span className="tier-badge-stat">5000d</span>
                <span className="tier-weight-stat">5x</span>
                <span className="tier-share-stat">50%</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">DXN Locked:</span>
                <span className="tier-stat-value">6,343</span>
              </div>
              <div className="tier-stat-row">
                <span className="tier-stat-label">GOLD Locked:</span>
                <span className="tier-stat-value">2,309</span>
              </div>
              <div className="tier-stat-row claimable">
                <span className="tier-stat-label">ETH Claimable:</span>
                <span className="tier-stat-value">6.2284 ETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bucket Info */}
      <div className="bucket-info-card">
        <h3><DollarSign size={22} style={{display: 'inline', marginRight: '6px', marginBottom: '-4px'}} /> Long-Term Bucket Sources</h3>
        <div className="bucket-sources">
          <div className="source-item"><CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} /> 1% from DXN staking fees</div>
          <div className="source-item"><CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} /> [X]% from GOLD staking fees</div>
          <div className="source-item"><CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} /> Future protocols (unlimited upside!)</div>
          <div className="source-item"><CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} /> Direct ETH donations welcome</div>
        </div>
        <div className="bucket-note">
          <TrendingUp size={16} style={{display: 'inline', marginRight: '6px'}} /> <strong>No cap on contributions!</strong> The dev's imagination is the limit. All donated ETH flows to long-term stakers.
        </div>
      </div>

      {/* Tier Selector */}
      <div className="tier-selector-card">
        <h3>Choose Your Lock Period</h3>
        <div className="tiers-grid">
          {tiers.map(tier => (
            <button
              key={tier.days}
              className={`tier-btn ${selectedTier === tier.days ? 'selected' : ''}`}
              onClick={() => setSelectedTier(tier.days)}
            >
              <div className="tier-days">{tier.days}d</div>
              <div className="tier-weight">{tier.weight}</div>
              <div className="tier-share">{tier.share}</div>
            </button>
          ))}
        </div>

        <div className="tier-info">
          <div className="tier-info-item">
            <span className="info-label">Selected Period</span>
            <span className="info-value">{selectedTier} days ({(selectedTier / 365).toFixed(1)} years)</span>
          </div>
          <div className="tier-info-item">
            <span className="info-label">Your Weight</span>
            <span className="info-value">{tiers.find(t => t.days === selectedTier)?.weight}</span>
          </div>
          <div className="tier-info-item">
            <span className="info-label">Bucket Share</span>
            <span className="info-value">{tiers.find(t => t.days === selectedTier)?.share}</span>
          </div>
        </div>

        <div className="permanent-warning">
          <AlertTriangle size={16} style={{display: 'inline', marginRight: '6px'}} /> <strong>PERMANENT LOCK:</strong> Your tokens are locked until maturity. Cannot be withdrawn early.
        </div>
      </div>

      {/* Lock Interface */}
      <div className="lock-interface">
        <div className="lock-card">
          <div className="lock-header">
            <h3>Lock Your Tokens</h3>
            <div className="lock-type-toggle">
              <button 
                className={`toggle-btn ${lockType === 'DXN' ? 'active' : ''}`}
                onClick={() => setLockType('DXN')}
              >
                DXN
              </button>
              <button 
                className={`toggle-btn ${lockType === 'GOLD' ? 'active' : ''}`}
                onClick={() => setLockType('GOLD')}
              >
                GOLD
              </button>
            </div>
          </div>

          <div className="input-section">
            <label>Amount to Lock</label>
            <div className="input-wrapper">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button 
                className="max-btn"
                onClick={() => setAmount(userBalances[lockType])}
              >
                MAX
              </button>
            </div>
            <div className="balance-display">
              Balance: {userBalances[lockType].toLocaleString()} {lockType}
            </div>
          </div>

          <button className="lock-submit-btn" onClick={handleLock}>
            🔐 Lock {lockType} for {selectedTier} Days
          </button>
        </div>
      </div>

      {/* Your Stakes Section */}
      <div className="your-stakes-section">
        <h3><Lock size={28} style={{display: 'inline', marginRight: '10px', marginBottom: '-6px'}} /> Your Stakes</h3>
        
        <div className="your-stakes-grid">
          {/* 1000d Tier */}
          <div className="your-stake-card">
            <div className="your-stake-header">
              <span className="your-stake-tier">1000d</span>
              <span className="your-stake-weight">1x Weight</span>
            </div>
            <div className="your-stake-amounts">
              <div className="your-stake-row">
                <span className="your-stake-label">DXN Locked:</span>
                <span className="your-stake-value">250</span>
              </div>
              <div className="your-stake-row">
                <span className="your-stake-label">GOLD Locked:</span>
                <span className="your-stake-value">0</span>
              </div>
              <div className="your-stake-row maturity">
                <span className="your-stake-label">Maturity:</span>
                <span className="your-stake-value">2028-01-15</span>
              </div>
            </div>
          </div>

          {/* 2000d Tier */}
          <div className="your-stake-card">
            <div className="your-stake-header">
              <span className="your-stake-tier">2000d</span>
              <span className="your-stake-weight">2x Weight</span>
            </div>
            <div className="your-stake-amounts">
              <div className="your-stake-row">
                <span className="your-stake-label">DXN Locked:</span>
                <span className="your-stake-value">0</span>
              </div>
              <div className="your-stake-row">
                <span className="your-stake-label">GOLD Locked:</span>
                <span className="your-stake-value">100</span>
              </div>
              <div className="your-stake-row maturity">
                <span className="your-stake-label">Maturity:</span>
                <span className="your-stake-value">2031-06-20</span>
              </div>
            </div>
          </div>

          {/* 3000d Tier */}
          <div className="your-stake-card">
            <div className="your-stake-header">
              <span className="your-stake-tier">3000d</span>
              <span className="your-stake-weight">3x Weight</span>
            </div>
            <div className="your-stake-amounts">
              <div className="your-stake-row">
                <span className="your-stake-label">DXN Locked:</span>
                <span className="your-stake-value">500</span>
              </div>
              <div className="your-stake-row">
                <span className="your-stake-label">GOLD Locked:</span>
                <span className="your-stake-value">75</span>
              </div>
              <div className="your-stake-row maturity">
                <span className="your-stake-label">Maturity:</span>
                <span className="your-stake-value">2033-01-20</span>
              </div>
            </div>
          </div>

          {/* 4000d Tier */}
          <div className="your-stake-card">
            <div className="your-stake-header">
              <span className="your-stake-tier">4000d</span>
              <span className="your-stake-weight">4x Weight</span>
            </div>
            <div className="your-stake-amounts">
              <div className="your-stake-row">
                <span className="your-stake-label">DXN Locked:</span>
                <span className="your-stake-value">0</span>
              </div>
              <div className="your-stake-row">
                <span className="your-stake-label">GOLD Locked:</span>
                <span className="your-stake-value">0</span>
              </div>
              <div className="your-stake-row maturity">
                <span className="your-stake-label">Maturity:</span>
                <span className="your-stake-value">—</span>
              </div>
            </div>
          </div>

          {/* 5000d Tier */}
          <div className="your-stake-card highlight">
            <div className="your-stake-header">
              <span className="your-stake-tier">5000d</span>
              <span className="your-stake-weight">5x Weight</span>
            </div>
            <div className="your-stake-amounts">
              <div className="your-stake-row">
                <span className="your-stake-label">DXN Locked:</span>
                <span className="your-stake-value">1,000</span>
              </div>
              <div className="your-stake-row">
                <span className="your-stake-label">GOLD Locked:</span>
                <span className="your-stake-value">250</span>
              </div>
              <div className="your-stake-row maturity">
                <span className="your-stake-label">Maturity:</span>
                <span className="your-stake-value">2038-06-15</span>
              </div>
            </div>
          </div>
        </div>

        <div className="your-stakes-summary">
          <div className="summary-item">
            <span className="summary-label">Total DXN Locked:</span>
            <span className="summary-value">1,750</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total GOLD Locked:</span>
            <span className="summary-value">425</span>
          </div>
          <div className="summary-item highlight">
            <span className="summary-label">Total Claimable ETH:</span>
            <span className="summary-value">2.4583 ETH</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h3><CheckCircle size={28} style={{display: 'inline', marginRight: '10px', marginBottom: '-6px'}} /> How Long-Term Staking (LTS) Works</h3>
        
        <div className="works-grid">
          <div className="works-card">
            <div className="works-number">1</div>
            <h4>Deposit Window</h4>
            <p>
              <strong>Epochs 26-51:</strong> Deposit window is OPEN. You can lock DXN or GOLD into any tier (1000d-5000d). 
              During this period, you can still add more to your position, but you CANNOT remove tokens.  This is for fairness so all users can see the total amount of tokens committed.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">2</div>
            <h4>Window Closes</h4>
            <p>
              <strong>After Epoch 51:</strong> Deposit window CLOSES permanently. All positions are now LOCKED until their individual maturity dates. 
              No new deposits possible. No standard unstaking available.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">3</div>
            <h4>Normal Benefits STILL Apply!</h4>
            <p>
              <strong>LTS DXN:</strong> Still earns tickets every epoch → GOLD (auto-staked & claimable).
              <br/><strong>LTS GOLD:</strong> Still earns 90% ETH fees (claimable anytime).
              <br/><br/>
              Long-term staking does NOT remove these benefits—it ADDS the LTS bucket rewards on top!
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">4</div>
            <h4>BONUS: LTS Bucket Rewards</h4>
            <p>
              Your locked position earns from the exclusive long-term bucket based on your tier weight. 
              This is EXTRA ETH on top of normal rewards. The longer your tier, the larger your share (1x-5x multiplier).
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">5</div>
            <h4>Maturity & Claim</h4>
            <p>
              Once your lock period completes, you can claim 100% of your DXN/GOLD plus all accumulated ETH rewards. 
              Until then, only ETH is claimable - your tokens remain locked.
            </p>
          </div>
        </div>

        {/* EES Section */}
        <div className="ees-explainer">
          <h4>⚡ Emergency End Stake (EES)</h4>
          <div className="ees-content">
            <div className="ees-warning">
              <strong>Use only in emergencies!</strong> EES allows early exit but with severe penalties:
            </div>
            
            <div className="ees-rules">
              <div className="ees-rule">
                <span className="rule-icon">📊</span>
                <div>
                  <strong>Partial Token Recovery:</strong> You can only claim the % of tokens equal to % of time completed. 
                  Example: Complete 10% of 5000 days? Claim only 10% of your tokens.
                </div>
              </div>
              
              <div className="ees-rule">
                <span className="rule-icon">🔒</span>
                <div>
                  <strong>Tokens Locked Forever:</strong> The unclaimed % of tokens (e.g., remaining 90%) is permanently locked in the contract. 
                  Essentially burned, never retrievable.
                </div>
              </div>
              
              <div className="ees-rule">
                <span className="rule-icon">❌</span>
                <div>
                  <strong>Forfeit All ETH Rewards:</strong> You lose ALL accumulated and future ETH rewards from your position. 
                  This includes everything you've earned but haven't claimed yet.
                </div>
              </div>
              
              <div className="ees-rule">
                <span className="rule-icon">💰</span>
                <div>
                  <strong>BUT You Keep Earning:</strong> Your locked position stays active! The forever-locked tokens continue earning NEW ETH 
                  from the long-term bucket. You can claim this new ETH, but your tokens are gone forever.
                </div>
              </div>
            </div>

            <div className="ees-example">
              <strong>Example:</strong> You lock 1000 DXN for 5000 days. After 500 days (10% complete), you EES:
              <ul>
                <li>✅ Claim: 100 DXN (10%)</li>
                <li>🔒 Locked Forever: 900 DXN (90%)</li>
                <li>❌ Forfeit: All accumulated ETH rewards</li>
                <li>💰 But: The 900 DXN position stays active, keeps earning NEW ETH for you to claim</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="positions-card">
        <h3>Your Active Positions</h3>
        {activePositions.length > 0 ? (
          <div className="positions-table">
            <div className="table-header">
              <div>Tier</div>
              <div>Amount</div>
              <div>Maturity</div>
              <div>Claimable ETH</div>
              <div>Action</div>
            </div>
            {activePositions.map((position, index) => (
              <div key={index} className="table-row">
                <div className="tier-badge">{position.tier}</div>
                <div>{position.amount}</div>
                <div>{position.maturity}</div>
                <div className="claimable-amount">{position.claimable}</div>
                <div>
                  <button 
                    className="claim-btn"
                    onClick={() => handleClaim(position)}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-positions">
            <p>No active positions yet. Lock your DXN or GOLD to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LongTermStaking;