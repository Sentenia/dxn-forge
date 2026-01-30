import React, { useState } from 'react';
import { TrendingUp, Unlock, Trophy, Gift, Coins } from 'lucide-react';

function UserActions() {
  // DXN staking state
  const [dxnTab, setDxnTab] = useState('stake'); // 'stake' or 'unstake'
  const [dxnAmount, setDxnAmount] = useState('');
  
  // GOLD staking state
  const [goldTab, setGoldTab] = useState('stake');
  const [goldAmount, setGoldAmount] = useState('');
  
  // Mock data
  const userDxnBalance = 1000;
  const userDxnStaked = 500;
  const userGoldBalance = 250;
  const userGoldStaked = 100;
  const userGoldAutoStaked = 75.5; // Auto-staked from ticket allocations
  const claimableGold = 127.35;
  const claimableETH = 2.4567;
  const currentEpoch = 7;

  // DXN handlers
  const handleDxnMax = () => {
    if (dxnTab === 'stake') {
      setDxnAmount(userDxnBalance.toString());
    } else {
      setDxnAmount(userDxnStaked.toString());
    }
  };

  const handleDxnAction = () => {
    if (!dxnAmount || Number(dxnAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (dxnTab === 'stake') {
      alert(`Mock: Staking ${dxnAmount} DXN!`);
    } else {
      alert(`Mock: Unstaking ${dxnAmount} DXN!`);
    }
    setDxnAmount('');
  };

  // GOLD handlers
  const handleGoldMax = () => {
    if (goldTab === 'stake') {
      setGoldAmount(userGoldBalance.toString());
    } else {
      setGoldAmount(userGoldStaked.toString());
    }
  };

  const handleGoldAction = () => {
    if (!goldAmount || Number(goldAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (goldTab === 'stake') {
      alert(`Mock: Staking ${goldAmount} GOLD!`);
    } else {
      alert(`Mock: Unstaking ${goldAmount} GOLD!`);
    }
    setGoldAmount('');
  };

  const handleClaimGold = () => {
    alert(`Mock: Claiming ${claimableGold} GOLD tokens!`);
  };

  const handleClaimETH = () => {
    alert(`Mock: Claiming ${claimableETH} ETH!`);
  };

  const handleClaimAll = () => {
    alert(`Mock: Claiming all rewards!\n${claimableGold} GOLD + ${claimableETH} ETH`);
  };

  return (
    <div className="user-actions">
      {/* Left: Stake DXN */}
      <div className="action-card">
        <div className="stake-header">
          <TrendingUp size={32} className="stake-icon" />
          <div className="stake-title">
            <h3>Stake DXN</h3>
            <p>Stake DXN to earn tickets for GOLD</p>
          </div>
        </div>

        {/* Currently Staked Display */}
        <div className="currently-staked">
          <div className="staked-row">
            <span className="staked-label">Currently Staked:</span>
            <span className="staked-amount">{userDxnStaked.toLocaleString()} DXN</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="stake-tabs">
          <button 
            className={`stake-tab ${dxnTab === 'stake' ? 'active' : ''}`}
            onClick={() => setDxnTab('stake')}
          >
            🔒 Stake
          </button>
          <button 
            className={`stake-tab ${dxnTab === 'unstake' ? 'active' : ''}`}
            onClick={() => setDxnTab('unstake')}
          >
            <Unlock size={16} style={{display: 'inline', marginRight: '4px'}} /> Unstake
          </button>
        </div>

        {/* Slider */}
        <div className="stake-slider-section">
          <label className="stake-label">Amount to {dxnTab === 'stake' ? 'Stake' : 'Unstake'}</label>
          <input
            type="range"
            min="0"
            max={dxnTab === 'stake' ? userDxnBalance : userDxnStaked}
            step="0.0001"
            value={dxnAmount || 0}
            onChange={(e) => setDxnAmount(e.target.value)}
            className="stake-slider"
          />
          <div className="slider-value">{Number(dxnAmount || 0).toFixed(4)} DXN</div>
        </div>

        {/* Amount Input */}
        <div className="stake-input-section">
          <div className="stake-input-wrapper">
            <input
              type="number"
              placeholder="0.00"
              value={dxnAmount}
              onChange={(e) => setDxnAmount(e.target.value)}
              className="stake-input"
            />
            <button className="max-btn" onClick={handleDxnMax}>
              MAX
            </button>
          </div>
          <div className="stake-balance">
            {dxnTab === 'stake' 
              ? `Balance: ${userDxnBalance.toLocaleString()} DXN` 
              : `Staked: ${userDxnStaked.toLocaleString()} DXN`
            }
          </div>
        </div>

        {/* Action Button */}
        <button className="stake-action-btn" onClick={handleDxnAction}>
          {dxnTab === 'stake' ? 'Stake DXN' : 'Unstake DXN'}
        </button>

        {/* Warning */}
        <div className={`stake-warning ${currentEpoch >= 26 ? 'unlocked' : 'locked'}`}>
          {currentEpoch < 26 
            ? '🔒 Staked DXN is locked from Epoch 1-25 for bonus multiplier and unlocks at Epoch 26' 
            : '✅ Staked DXN is now unlocked - you can unstake anytime'}
        </div>
      </div>

      {/* Right: Stake GOLD + Rewards */}
      <div className="action-card">
        {/* GOLD Staking Section */}
        <div className="stake-header">
          <Trophy size={32} className="stake-icon" />
          <div className="stake-title">
            <h3>Stake GOLD</h3>
            <p>Stake GOLD to earn additional ETH</p>
          </div>
        </div>

        {/* Currently Staked Display */}
        <div className="currently-staked">
          <div className="staked-row">
            <span className="staked-label">Total Staked:</span>
            <span className="staked-amount">{(userGoldStaked + userGoldAutoStaked).toLocaleString()} GOLD</span>
          </div>
          <div className="staked-breakdown">
            <span>Manual: {userGoldStaked.toLocaleString()}</span>
            <span className="divider">•</span>
            <span>Auto-staked: {userGoldAutoStaked.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="stake-tabs">
          <button 
            className={`stake-tab ${goldTab === 'stake' ? 'active' : ''}`}
            onClick={() => setGoldTab('stake')}
          >
            🔒 Stake
          </button>
          <button 
            className={`stake-tab ${goldTab === 'unstake' ? 'active' : ''}`}
            onClick={() => setGoldTab('unstake')}
          >
            <Unlock size={16} style={{display: 'inline', marginRight: '4px'}} /> Unstake
          </button>
        </div>

        {/* Slider */}
        <div className="stake-slider-section">
          <label className="stake-label">Amount to {goldTab === 'stake' ? 'Stake' : 'Unstake'}</label>
          <input
            type="range"
            min="0"
            max={goldTab === 'stake' ? userGoldBalance : userGoldStaked}
            step="0.0001"
            value={goldAmount || 0}
            onChange={(e) => setGoldAmount(e.target.value)}
            className="stake-slider gold"
          />
          <div className="slider-value gold">{Number(goldAmount || 0).toFixed(4)} GOLD</div>
          
          {/* Unstake Tooltip */}
          {goldTab === 'unstake' && (
            <div className="unstake-tooltip">
              ℹ️ Can't unstake recently staked GOLD until next cycle completes
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="stake-input-section">
          <label className="stake-label">Amount to {goldTab === 'stake' ? 'Stake' : 'Unstake'}</label>
          <div className="stake-input-wrapper">
            <input
              type="number"
              placeholder="0.00"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              className="stake-input"
            />
            <button className="max-btn" onClick={handleGoldMax}>
              MAX
            </button>
          </div>
          <div className="stake-balance">
            {goldTab === 'stake' 
              ? `Balance: ${userGoldBalance.toLocaleString()} GOLD` 
              : `Staked: ${userGoldStaked.toLocaleString()} GOLD`
            }
          </div>
        </div>

        {/* Action Button */}
        <button className="stake-action-btn gold" onClick={handleGoldAction}>
          {goldTab === 'stake' ? 'Stake GOLD' : 'Unstake GOLD'}
        </button>

        {/* GOLD Locking Disclaimer */}
        <div className="stake-warning gold-warning">
          ℹ️ GOLD uses DBXen's lock+1 rule: Staked GOLD locks until the next cycle completes and doesn't earn ETH until that cycle completes
        </div>

        {/* Divider */}
        <div className="section-divider"></div>

        {/* Claimable Rewards Section */}
        <div className="rewards-header">
          <Gift size={20} className="rewards-icon" />
          <span>Claimable Rewards</span>
        </div>

        <div className="rewards-list">
          <div className="reward-item">
            <div className="reward-info">
              <Trophy size={20} className="reward-icon" />
              <div className="reward-details">
                <span className="reward-label">GOLD Tokens</span>
                <span className="reward-value">{claimableGold.toLocaleString()}</span>
              </div>
            </div>
            <button className="reward-claim" onClick={handleClaimGold}>
              Claim
            </button>
          </div>

          <div className="reward-item">
            <div className="reward-info">
              <Coins size={20} className="reward-icon" style={{color: '#10b981'}} />
              <div className="reward-details">
                <span className="reward-label">ETH Fees</span>
                <span className="reward-value">{claimableETH.toLocaleString()}</span>
              </div>
            </div>
            <button className="reward-claim" onClick={handleClaimETH}>
              Claim
            </button>
          </div>
        </div>

        <button className="action-button" onClick={handleClaimAll}>
          Claim All Rewards
        </button>
      </div>
    </div>
  );
}

export default UserActions;