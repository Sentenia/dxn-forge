import React, { useState } from 'react';
import { 
  Lock, 
  Trophy, 
  Coins, 
  AlertTriangle, 
  Gem, 
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Loader,
  ExternalLink,
  Flame
} from 'lucide-react';
import './LongTermStaking.css';
import NavAccordion from './NavAccordion';
import ConfirmModal from './ConfirmModal';
import { useLTS } from '../hooks/useLTS';

function LongTermStaking({ onNavigate, provider, account }) {
  const [selectedTier, setSelectedTier] = useState(4);
  const [lockType, setLockType] = useState('DXN');
  const [amount, setAmount] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [commitMode, setCommitMode] = useState('single'); // 'single' or 'all'

  const {
    loading,
    error,
    currentCrucible,
    crucibleInfo,
    isWindowOpen,
    windowClosed,
    canStartNewCrucible,
    currentCycle,
    currentEpoch,
    totalDXNByTier,
    totalGOLDByTier,
    ltsEthBucket,
    tierSnapshots,
    userPendingDXN,
    userPendingGOLD,
    userHasMinted,
    userNFTs,
    userStakedDXN,
    userStakedGOLD,
    addDXNToLTS,
    addGOLDToLTS,
    addDXNAllToLTS,
    addGOLDAllToLTS,
    mintLTSNFTs,
    claimLTS,
    startNewCrucible,
    getTierEthAllocation,
    getWindowStatus,
    TIERS,
    refreshData,
  } = useLTS(provider, account);

  const tiers = TIERS.map(t => ({
    ...t,
    weight: `${t.weight}x`,
    share: `${((t.weight / 15) * 100).toFixed(1)}%`,
  }));

  const userBalances = {
    DXN: parseFloat(userStakedDXN) || 0,
    GOLD: parseFloat(userStakedGOLD) || 0,
  };

  const totalDXNLocked = totalDXNByTier.reduce((a, b) => a + b, 0);
  const totalGOLDLocked = totalGOLDByTier.reduce((a, b) => a + b, 0);
  const userTotalDXN = userPendingDXN.reduce((a, b) => a + b, 0);
  const userTotalGOLD = userPendingGOLD.reduce((a, b) => a + b, 0);
  const hasPendingToMint = !userHasMinted && (userTotalDXN > 0 || userTotalGOLD > 0);
  const canDeposit = isWindowOpen;

  const handleLock = (mode) => {
    if (!canDeposit) {
      alert(`Deposit window is not open. Current cycle: ${currentCycle}`);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (Number(amount) > userBalances[lockType]) {
      alert(`Insufficient ${lockType} balance`);
      return;
    }
    setCommitMode(mode);
    setShowLockModal(true);
  };

  const confirmLock = async () => {
    setShowLockModal(false);
    setActionLoading(true);
    try {
      if (commitMode === 'all') {
        // Use All function - splits across all tiers
        if (lockType === 'DXN') {
          await addDXNAllToLTS(amount);
        } else {
          await addGOLDAllToLTS(amount);
        }
        alert(`✅ Successfully committed ${amount} ${lockType} across ALL tiers in Crucible ${currentCrucible}!`);
      } else {
        // Single tier
        if (lockType === 'DXN') {
          await addDXNToLTS(amount, selectedTier);
        } else {
          await addGOLDToLTS(amount, selectedTier);
        }
        alert(`✅ Successfully committed ${amount} ${lockType} to ${TIERS[selectedTier].days}d tier in Crucible ${currentCrucible}!`);
      }
      setAmount('');
    } catch (err) {
      console.error('Lock failed:', err);
      alert(`❌ Failed to lock: ${err.reason || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMintNFTs = async () => {
    setActionLoading(true);
    try {
      await mintLTSNFTs();
      alert('✅ NFTs minted successfully! Your positions are now tradeable.');
    } catch (err) {
      console.error('Mint failed:', err);
      alert(`❌ Failed to mint NFTs: ${err.reason || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async (nft) => {
    if (!nft.isMature) {
      alert('This position is not mature yet.');
      return;
    }
    setActionLoading(true);
    try {
      await claimLTS(nft.tokenId);
      alert(`✅ Claimed ${nft.amount} ${nft.assetSymbol} + ${nft.claimableEth} ETH!`);
    } catch (err) {
      console.error('Claim failed:', err);
      alert(`❌ Failed to claim: ${err.reason || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartNewCrucible = async () => {
    setActionLoading(true);
    try {
      await startNewCrucible();
      alert(`✅ Crucible ${currentCrucible + 1} started! New deposit window is now open.`);
    } catch (err) {
      console.error('Start crucible failed:', err);
      alert(`❌ Failed to start new crucible: ${err.reason || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const lockWarnings = [
    'Once the deposit window closes, your tokens are PERMANENTLY LOCKED until maturity',
    'There is NO early withdrawal option',
    'If you need liquidity, you can TRADE your NFT position on secondary markets',
    'Your locked tokens still earn NORMAL staking rewards (tickets for DXN, ETH for GOLD)',
    'PLUS you earn from the exclusive 3.12% LTS ETH bucket upon maturity',
  ];

  const lockDetails = [
    { label: 'Crucible', value: `Crucible ${currentCrucible}` },
    { label: 'Amount', value: `${amount} ${lockType}` },
    { label: 'Lock Period', value: commitMode === 'all' ? 'All Tiers (1000-5000 days)' : `${TIERS[selectedTier].days} days (${(TIERS[selectedTier].days / 365).toFixed(1)} years)` },
    { label: 'Distribution', value: commitMode === 'all' ? 'Split evenly across 5 tiers' : `Tier ${selectedTier + 1} only` },
  ];

  const windowStatus = getWindowStatus();

  if (loading) {
    return (
      <div className="longterm-page">
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Loading LTS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="longterm-page">
      {/* Hero Section */}
      <div className="longterm-hero">
        <h1><Gem size={48} style={{display: 'inline', marginBottom: '-8px', marginRight: '12px'}} /> Long-Term Staking</h1>
        <p className="hero-tagline">"Enter the Crucible to Steel Your Mettle"</p>
        <p>Lock DXN or GOLD for 1000-5000 days and earn from exclusive ETH pools</p>
        
        {/* Crucible Badge */}
        <div className="crucible-badge">
          <Flame size={20} /> Crucible {currentCrucible}
        </div>
        
        <div className={`window-status ${windowStatus.status}`}>
          <Clock size={18} style={{display: 'inline', marginRight: '6px'}} /> 
          Deposit Window: <strong>{windowStatus.text}</strong>
        </div>
      </div>

      {/* Navigation */}
      <NavAccordion currentPage="longterm" onNavigate={onNavigate} />

      {/* Start New Crucible Button */}
      {canStartNewCrucible && (
        <div className="start-crucible-section">
          <div className="start-crucible-card">
            <Flame size={32} className="flame-icon" />
            <h3>🔥 Crucible {currentCrucible} Complete!</h3>
            <p>Tier 5 has matured. Start Crucible {currentCrucible + 1} to open a new 99-day deposit window.</p>
            <button 
              className="start-crucible-btn"
              onClick={handleStartNewCrucible}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <><Loader className="spinner-inline" size={18} /> Starting...</>
              ) : (
                <>🔥 Start Crucible {currentCrucible + 1}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Critical Warning Banner */}
      <div className="critical-warning-banner">
        <AlertTriangle size={48} className="warning-icon" />
        <div className="warning-content">
          <h3>PERMANENT LOCK COMMITMENT</h3>
          <p>
            Once the deposit window <strong>closes at Day {crucibleInfo.end}</strong>, all committed tokens are <strong>PERMANENTLY LOCKED</strong> until their maturity date. 
            There is NO early withdrawal. Your positions become tradeable NFTs — if you need liquidity, sell your NFT on secondary markets.
          </p>
        </div>
      </div>

      {/* Protocol Stats */}
      <div className="protocol-stats-section">
        <h3><BarChart3 size={24} style={{display: 'inline', marginRight: '8px', marginBottom: '-4px'}} /> Crucible {currentCrucible} Statistics</h3>
        
        <div className="main-stats-grid">
          <div className="stat-card total">
            <Lock size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">Total DXN Locked</div>
              <div className="stat-value">{totalDXNLocked.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <div className="stat-sublabel">Crucible {currentCrucible}</div>
            </div>
          </div>

          <div className="stat-card total">
            <Trophy size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">Total GOLD Locked</div>
              <div className="stat-value">{totalGOLDLocked.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <div className="stat-sublabel">Crucible {currentCrucible}</div>
            </div>
          </div>

          <div className="stat-card total">
            <Coins size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">LTS ETH Bucket</div>
              <div className="stat-value highlight">{parseFloat(ltsEthBucket).toFixed(8)} ETH</div>
              <div className="stat-sublabel">3.12% of all fees</div>
            </div>
          </div>

          <div className="stat-card total">
            <Clock size={42} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-label">Current Cycle</div>
              <div className="stat-value">{currentCycle}</div>
              <div className="stat-sublabel">Day {currentCycle}</div>
            </div>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="tier-breakdown">
          <h4>Breakdown by Tier</h4>
          <div className="tier-stats-grid">
            {tiers.map((tier, index) => {
              const dxnLocked = totalDXNByTier[index] || 0;
              const goldLocked = totalGOLDByTier[index] || 0;
              const tierEth = getTierEthAllocation(index);
              const snapshot = tierSnapshots[index];
              
              return (
                <div key={tier.days} className={`tier-stat-card ${index === 4 ? 'highlight' : ''}`}>
                  <div className="tier-stat-header">
                    <span className="tier-badge-stat">Tier {index + 1}</span>
                    <span className="tier-weight-stat">{tier.weight}</span>
                    <span className="tier-share-stat">{tier.share}</span>
                  </div>
                  <div className="tier-stat-row">
                    <span className="tier-stat-label">{tier.days} days</span>
                  </div>
                  <div className="tier-stat-row">
                    <span className="tier-stat-label">DXN Locked:</span>
                    <span className="tier-stat-value">{dxnLocked.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="tier-stat-row">
                    <span className="tier-stat-label">GOLD Locked:</span>
                    <span className="tier-stat-value">{goldLocked.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="tier-stat-row claimable">
                    <span className="tier-stat-label">ETH Allocation:</span>
                    <span className="tier-stat-value">{tierEth} ETH</span>
                  </div>
                  {snapshot?.isMature && (
                    <div className="tier-mature-badge">
                      <CheckCircle size={12} /> MATURE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="tier-selector-card">
        <h3>Choose Your Lock Period</h3>
        <div className="tiers-grid">
          {tiers.map((tier, index) => (
            <button
              key={tier.days}
              className={`tier-btn ${selectedTier === index ? 'selected' : ''}`}
              onClick={() => setSelectedTier(index)}
            >
              <div className="tier-days">Tier {index + 1}</div>
              <div className="tier-label">{tier.label}</div>
              <div className="tier-weight">{tier.weight}</div>
              <div className="tier-share">{tier.share}</div>
            </button>
          ))}
        </div>

        <div className="tier-info">
          <div className="tier-info-item">
            <span className="info-label">Selected Period</span>
            <span className="info-value">{TIERS[selectedTier].days} days ({(TIERS[selectedTier].days / 365).toFixed(1)} years)</span>
          </div>
          <div className="tier-info-item">
            <span className="info-label">Your Weight</span>
            <span className="info-value">{TIERS[selectedTier].weight}x</span>
          </div>
          <div className="tier-info-item">
            <span className="info-label">Tier Share</span>
            <span className="info-value">{((TIERS[selectedTier].weight / 15) * 100).toFixed(1)}%</span>
          </div>
          <div className="tier-info-item">
            <span className="info-label">Maturity Cycle</span>
            <span className="info-value">Day {crucibleInfo.lock + TIERS[selectedTier].days}</span>
          </div>
        </div>

        <div className="permanent-warning">
          <AlertTriangle size={16} style={{display: 'inline', marginRight: '6px'}} /> 
          <strong>PERMANENT LOCK:</strong> Tokens cannot be withdrawn until maturity. Trade your NFT if you need liquidity.
        </div>
      </div>

      {/* Lock Interface */}
      <div className="lock-interface">
        <div className="lock-card">
          <div className="lock-header">
            <h3>Commit Tokens to Crucible {currentCrucible}</h3>
            <div className={`lock-type-toggle ${lockType === 'GOLD' ? 'gold-mode' : ''}`}>
              <button 
                className={`toggle-btn ${lockType === 'DXN' ? 'active' : ''}`}
                onClick={() => setLockType('DXN')}
              >
                DXN
              </button>
              <button 
                className={`toggle-btn ${lockType === 'GOLD' ? 'active gold' : ''}`}
                onClick={() => setLockType('GOLD')}
              >
                GOLD
              </button>
            </div>
          </div>

          {/* Wallet balance for selected token */}
          <div className="token-balance-box">
            Your {lockType} Balance: <strong>{userBalances[lockType].toLocaleString(undefined, {maximumFractionDigits: 4})} {lockType}</strong>
          </div>

          <div className="input-section">
            <label>Amount</label>
            <div className="input-wrapper">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={actionLoading}
              />
              <button 
                className="max-btn"
                onClick={() => setAmount(userBalances[lockType].toString())}
                disabled={actionLoading}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Two Commit Buttons */}
          <div className="commit-buttons">
            <button 
              className={`lock-submit-btn ${lockType === 'GOLD' ? 'gold-btn' : ''} ${!canDeposit ? 'disabled-look' : ''}`}
              onClick={() => handleLock('single')}
              disabled={actionLoading || !amount || Number(amount) <= 0}
            >
              {actionLoading ? (
                <><Loader className="spinner-inline" size={18} /> Processing...</>
              ) : (
                <>🔐 Commit {lockType} to Tier {selectedTier + 1} {!canDeposit && '(Window Closed)'}</>
              )}
            </button>

            <button 
              className={`lock-submit-btn all-tiers-btn ${lockType === 'GOLD' ? 'gold-btn' : ''} ${!canDeposit ? 'disabled-look' : ''}`}
              onClick={() => handleLock('all')}
              disabled={actionLoading || !amount || Number(amount) <= 0}
            >
              {actionLoading ? (
                <><Loader className="spinner-inline" size={18} /> Processing...</>
              ) : (
                <>🔥 Commit {lockType} to ALL Tiers {!canDeposit && '(Window Closed)'}</>
              )}
            </button>
            <div className="all-tiers-hint">
              Splits your {lockType} evenly across all 5 tiers in one transaction
            </div>
          </div>
        </div>
      </div>


      {/* Mint NFTs Section */}
      {windowClosed && hasPendingToMint && (
        <div className="mint-nfts-section">
          <div className="mint-card">
            <h3>🎉 Mint Your Crucible {currentCrucible} NFTs</h3>
            <p>The deposit window has closed. Mint your positions as NFTs to enable trading and claiming.</p>
            <div className="pending-summary">
              {userTotalDXN > 0 && <span>DXN Committed: {userTotalDXN.toLocaleString()}</span>}
              {userTotalGOLD > 0 && <span>GOLD Committed: {userTotalGOLD.toLocaleString()}</span>}
            </div>
            <button 
              className="mint-btn"
              onClick={handleMintNFTs}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <><Loader className="spinner-inline" size={18} /> Minting...</>
              ) : (
                <>✨ Mint My NFTs</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Your Active Positions (Pending Deposits) */}
      <div className="positions-card">
        <h3><Lock size={24} style={{display: 'inline', marginRight: '10px', marginBottom: '-4px'}} /> Your Active Positions</h3>
        
        {!account ? (
          <div className="no-positions">
            <p>Connect your wallet to view your positions.</p>
          </div>
        ) : windowClosed && userHasMinted ? (
          <div className="no-positions">
            <p>✅ Your positions have been transformed into NFTs! See "Your NFTs" below.</p>
            <p className="subtext">New positions will be available when Crucible {currentCrucible + 1} opens.</p>
          </div>
        ) : windowClosed && hasPendingToMint ? (
          <div className="no-positions">
            <p>⏳ Window closed! Mint your NFTs above to view them.</p>
          </div>
        ) : isWindowOpen ? (
          <div className="no-positions">
            <p>Commit DXN or GOLD above to create LTS positions. NFTs will be minted when the window closes.</p>
            {(userTotalDXN > 0 || userTotalGOLD > 0) && (
              <div className="pending-preview">
                <h4>Your Pending Commitments (Crucible {currentCrucible}):</h4>
                <div className="pending-grid">
                  {TIERS.map((tier, idx) => {
                    const dxn = userPendingDXN[idx];
                    const gold = userPendingGOLD[idx];
                    if (dxn === 0 && gold === 0) return null;
                    return (
                      <div key={tier.days} className="pending-item">
                        <span className="pending-tier">Tier {idx + 1} ({tier.label})</span>
                        {dxn > 0 && <span>{dxn.toLocaleString()} DXN</span>}
                        {gold > 0 && <span>{gold.toLocaleString()} GOLD</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-positions">
            <p>The deposit window is closed. {canStartNewCrucible ? 'Start a new Crucible to participate!' : `Wait for Crucible ${currentCrucible + 1} to open.`}</p>
          </div>
        )}
      </div>

      {/* Your NFTs Section */}
      {userNFTs.length > 0 && (
        <div className="nfts-section">
          <h3><Gem size={24} style={{display: 'inline', marginRight: '10px', marginBottom: '-4px'}} /> Your Crucible NFTs</h3>
          <div className="nfts-grid">
            {userNFTs.map((nft) => (
              <div key={nft.tokenId} className={`nft-card ${nft.assetSymbol.toLowerCase()} ${nft.isMature ? 'mature' : ''}`}>
                {/* NFT Art Placeholder */}
                <div className={`nft-art tier-${nft.tier}`}>
                  <div className="nft-art-inner">
                    <Gem size={48} className="nft-gem-icon" />
                    <div className="nft-art-tier">Tier {Number(nft.tier) + 1}</div>
                    <div className="nft-art-asset">{nft.assetSymbol}</div>
                  </div>
                  {nft.isMature && <div className="mature-ribbon">READY</div>}
                </div>
                
                {/* NFT Details */}
                <div className="nft-details">
                  <div className="nft-header">
                    <span className="nft-id">#{nft.tokenId}</span>
                    <span className="nft-crucible">Crucible {nft.crucible}</span>
                  </div>
                  
                  <div className="nft-amount">
                    {parseFloat(nft.amount).toLocaleString(undefined, {maximumFractionDigits: 2})} {nft.assetSymbol}
                  </div>
                  
                  <div className="nft-info-row">
                    <span className="nft-label">Lock Period:</span>
                    <span className="nft-value">{nft.tierLabel}</span>
                  </div>
                  
                  <div className="nft-info-row">
                    <span className="nft-label">Maturity:</span>
                    <span className={`nft-value ${nft.isMature ? 'mature-text' : ''}`}>
                      {nft.isMature ? '✅ READY' : `Day ${nft.unlockCycle}`}
                    </span>
                  </div>
                  
                  {!nft.isMature && (
                    <div className="nft-info-row">
                      <span className="nft-label">Remaining:</span>
                      <span className="nft-value">{nft.daysRemaining} days</span>
                    </div>
                  )}
                  
                  <div className="nft-info-row eth-row">
                    <span className="nft-label">ETH Share:</span>
                    <span className="nft-value eth-value">{parseFloat(nft.claimableEth).toFixed(6)} ETH</span>
                  </div>
                  
                  <button 
                    className={`nft-claim-btn ${nft.isMature ? 'ready' : 'locked'}`}
                    onClick={() => handleClaim(nft)}
                    disabled={!nft.isMature || actionLoading}
                  >
                    {nft.isMature ? (
                      <><CheckCircle size={16} /> Claim All</>
                    ) : (
                      <><Lock size={16} /> Locked</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NFT Trading Info */}
      <div className="nft-trading-info">
        <h4>💎 NFT Liquidity</h4>
        <div className="nft-info-content">
          <p>
            Need liquidity before maturity? <strong>Sell your NFT!</strong> Your LTS position is a standard ERC-721 token 
            tradeable on any NFT marketplace. The buyer inherits all rights: the locked tokens, the staking rewards, 
            and the LTS ETH claim at maturity.
          </p>
          <div className="marketplace-links">
            <a href="https://testnets.opensea.io" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> OpenSea (Testnet)
            </a>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h3><CheckCircle size={28} style={{display: 'inline', marginRight: '10px', marginBottom: '-6px'}} /> How Long-Term Staking Works</h3>
        
        <div className="works-grid">
          <div className="works-card">
            <div className="works-number">1</div>
            <h4>Deposit Window (99 days)</h4>
            <p>
              <strong>Days 1-99 of each Crucible:</strong> Commit your staked DXN or GOLD to any tier (1000d-5000d). 
              You can add more anytime during this window, but commitments are FINAL and cannot be removed.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">2</div>
            <h4>Window Closes → NFT Mint</h4>
            <p>
              <strong>Day 100:</strong> The window closes. Mint your positions as NFTs. 
              Each position becomes a tradeable ERC-721 token you can sell on OpenSea, Blur, etc.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">3</div>
            <h4>Earn Double Rewards</h4>
            <p>
              <strong>LTS DXN:</strong> Still earns tickets → GOLD every epoch.
              <br/><strong>LTS GOLD:</strong> Still earns 88% ETH fees.
              <br/><br/>
              <strong>PLUS:</strong> Earn from the exclusive 3.12% LTS ETH bucket based on your tier weight!
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">4</div>
            <h4>Maturity & Claim</h4>
            <p>
              When your tier matures (1000-5000 days), claim your full position: 
              all your DXN/GOLD <strong>plus</strong> your share of the LTS ETH bucket.
              Claiming burns the NFT — one sweep, everything to your wallet.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">5</div>
            <h4>Infinite Crucibles</h4>
            <p>
              After Tier 5 matures (Day 5100), anyone can start <strong>Crucible 2</strong>. 
              New 99-day window opens. Unclaimed ETH from Crucible 1 rolls over. 
              This continues forever — Crucible 3, 4, 5...
            </p>
          </div>
        </div>
      </div>

      {/* Lock Confirmation Modal */}
      <ConfirmModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onConfirm={confirmLock}
        title={`CONFIRM CRUCIBLE ${currentCrucible} COMMITMENT`}
        warnings={lockWarnings}
        details={lockDetails}
        confirmWord="LOCK"
      />

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="loading-overlay">
          <Loader className="spinner" size={48} />
          <p>Processing transaction...</p>
        </div>
      )}
    </div>
  );
}

export default LongTermStaking;