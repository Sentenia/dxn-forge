import React, { useState, useEffect } from 'react';
import { Coins, Lock, LockKeyhole, Flame, Zap, Trophy } from 'lucide-react';

function BigCards() {
  const [burnPercentage, setBurnPercentage] = useState(100);
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // seconds remaining
  const [lastBurnTime, setLastBurnTime] = useState(null); // mock last burn timestamp

  const availableETH = 2.4567;
  const ethToBurn = (availableETH * burnPercentage) / 100;

  // Mock cooldown timer
  useEffect(() => {
    if (!lastBurnTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastBurn = (now - lastBurnTime) / 1000; // seconds
      const remaining = Math.max(0, 86400 - timeSinceLastBurn); // 24hrs = 86400s
      
      setCooldownRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastBurnTime]);

  const formatCooldown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClaimETH = () => {
    alert('Mock: Claiming 3.8421 ETH to Forge Vault!');
  };

  const handleBuyAndBurn = () => {
    if (cooldownRemaining > 0) {
      alert('Buy & Burn is on cooldown!');
      return;
    }
    
    // Simulate transaction - 80% success rate if burning >75%, otherwise always succeeds
    const willSucceed = burnPercentage <= 75 || Math.random() > 0.2;
    
    if (willSucceed) {
      alert(`✅ SUCCESS!\n\nExecuted Buy & Burn:\n${burnPercentage}% of available ETH\n${ethToBurn.toFixed(4)} ETH → DXN → GOLD\n\n24hr cooldown starts now`);
      setLastBurnTime(Date.now()); // Only set cooldown on SUCCESS
    } else {
      alert(`❌ TRANSACTION REVERTED!\n\nSlippage too high for ${ethToBurn.toFixed(4)} ETH.\n\nTry a smaller percentage (25%, 50%, or 75%).\n\nNo cooldown applied - you can try again immediately.`);
      // No cooldown set - button stays active
    }
  };

  return (
    <div className="big-cards">
      {/* Left: Claimable ETH */}
      <div className="big-card">
        <div className="big-card-header">
          <Coins size={24} className="big-card-icon" />
          <span>Claimable ETH</span>
        </div>
        <div className="big-card-value">3.8421</div>
        <div className="big-card-label">Protocol fees</div>
        <button className="claim-button" onClick={handleClaimETH}>
          Claim to Forge Vault
        </button>
      </div>

      {/* Center: Total DXN & GOLD Staked + Locked */}
      <div className="big-card center-card">
        {/* DXN Staked */}
        <div className="center-section">
          <div className="center-header">
            <Lock size={18} className="center-icon" />
            <span className="center-label">TOTAL DXN STAKED</span>
          </div>
          <div className="center-value">15,428.5</div>
          <div className="center-sublabel">Staked in Forge</div>
        </div>

        {/* Divider */}
        <div className="center-divider"></div>

        {/* DXN Locked */}
        <div className="center-section">
          <div className="center-header">
            <LockKeyhole size={18} className="center-icon" />
            <span className="center-label">TOTAL DXN LOCKED</span>
          </div>
          <div className="center-value">3,847.2</div>
          <div className="center-sublabel">Long-term positions</div>
        </div>

        {/* Divider */}
        <div className="center-divider"></div>

        {/* GOLD Staked */}
        <div className="center-section">
          <div className="center-header">
            <Trophy size={18} className="center-icon gold-icon" />
            <span className="center-label">TOTAL GOLD STAKED</span>
          </div>
          <div className="center-value gold-value">5,234.8</div>
          <div className="center-sublabel">Manual + auto-staked</div>
        </div>

        {/* Divider */}
        <div className="center-divider"></div>

        {/* GOLD Locked */}
        <div className="center-section">
          <div className="center-header">
            <LockKeyhole size={18} className="center-icon gold-icon" />
            <span className="center-label">TOTAL GOLD LOCKED</span>
          </div>
          <div className="center-value gold-value">1,892.3</div>
          <div className="center-sublabel">Long-term positions</div>
        </div>
      </div>

      {/* Right: Buy & Burn */}
      <div className="big-card">
        <div className="big-card-header">
          <Flame size={24} className="big-card-icon" />
          <span>Buy & Burn</span>
          <span className="tooltip-trigger" title="If transaction fails due to slippage, try a smaller percentage">
            ℹ️
          </span>
        </div>
        
        <div className="bnb-info">
          <div className="bnb-stat-row">
            <span className="bnb-label">Available ETH</span>
            <span className="bnb-value">{availableETH.toFixed(4)} ETH</span>
          </div>
          
          {/* Percentage Selector */}
          <div className="percentage-selector">
            <label className="percentage-label">Burn Percentage</label>
            <div className="percentage-buttons">
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  className={`percentage-btn ${burnPercentage === pct ? 'active' : ''}`}
                  onClick={() => setBurnPercentage(pct)}
                  disabled={cooldownRemaining > 0}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="bnb-stat-row highlight">
            <span className="bnb-label">ETH to Burn</span>
            <span className="bnb-value">{ethToBurn.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Cooldown Timer */}
        {cooldownRemaining > 0 && (
          <div className="cooldown-timer">
            ⏰ Next burn available in: {formatCooldown(cooldownRemaining)}
          </div>
        )}

        <div className="bnb-note">
          ℹ️ Buys DXN at market price, burns it, and mints GOLD 1:1. 24hr cooldown after execution.  <b>Each execution ends the current epoch; a new epoch begins.</b>
        </div>
        
        <button 
          className="claim-button" 
          onClick={handleBuyAndBurn}
          disabled={cooldownRemaining > 0}
        >
          {cooldownRemaining > 0 ? 'On Cooldown' : 'Execute Buy & Burn'}
        </button>
      </div>
    </div>
  );
}

export default BigCards;