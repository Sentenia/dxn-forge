import React, { useState, useEffect } from 'react';
import { Coins, Lock, LockKeyhole, Flame, Zap, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useForgeData } from '../hooks/useForgeData';
import { CONTRACTS, FORGE_ABI, MOCK_DBXEN_ABI } from '../contracts';

function BigCards() {
  const { address, connected } = useWallet();
  const { protocol, refetch } = useForgeData();

  const [burnPercentage, setBurnPercentage] = useState(100);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  const [burnLoading, setBurnLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type, message) => setToast({ show: true, type, message });


  // Calculate cooldown
  useEffect(() => {
    if (!protocol.lastClaimFeesTime) return;
    
    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const lastClaim = protocol.lastClaimFeesTime || 0;
      const remaining = Math.max(0, (lastClaim + 86400) - now);
      setCooldownRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [protocol.lastClaimFeesTime]);

  const availableETH = parseFloat(protocol.pendingBuyBurnEth) || 0;
  const ethToBurn = (availableETH * burnPercentage) / 100;

  const formatCooldown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    const val = parseFloat(num);
    if (val > 0 && val < 0.01) {
      return val.toFixed(6);
    }
    if (val > 0 && val < 1) {
      return val.toFixed(6);
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const handleClaimETH = async () => {
    if (!connected) return;

    setClaimLoading(true);
    setClaimError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);

      const tx = await forge.claimFees();
      await tx.wait();
      showToast('success', 'ETH claimed to Forge vault');
      refetch();
    } catch (err) {
      console.error('Claim error:', err);
      const errorData = err.data || '';
      if (errorData.includes('3dc61b4a')) {
        setClaimError('Must wait for next DBXen cycle');
      } else if (errorData.includes('Cooldown') || err.message?.includes('Cooldown')) {
        setClaimError('24h cooldown not passed');
      } else if (errorData.includes('NoEth') || err.message?.includes('NoEth')) {
        setClaimError('Not enough ETH to claim');
      } else {
        setClaimError('Claim failed - try again later');
      }
    } finally {
      setClaimLoading(false);
    }
  };

  const handleBuyAndBurn = async () => {
    if (!connected || availableETH === 0 || protocol.ticketsThisEpoch === 0) return;

    setBurnLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);

      // Calculate amount to burn (0 = burn all)
      const amountToBurn = burnPercentage === 100 ? 0 : ethers.parseEther(ethToBurn.toString());

      const tx = await forge.buyAndBurn(amountToBurn, 0);
      await tx.wait();
      showToast('success', 'Buy & Burn executed - epoch ended');
      refetch();
    } catch (err) {
      console.error('Buy & Burn error:', err);
      showToast('error', `Buy & Burn failed: ${err.reason || err.message}`);
    } finally {
      setBurnLoading(false);
    }
  };

  // Get real totals from protocol
  const totalDXNStaked = parseFloat(protocol.totalDXNStaked) + parseFloat(protocol.totalDXNPending) || 0;
  const totalGOLDStaked = parseFloat(protocol.totalAutoStakedGold) + parseFloat(protocol.totalManualGoldStaked) || 0;
  const dxnInCrucible = parseFloat(protocol.globalLtsDXN) || 0;
  const goldInCrucible = parseFloat(protocol.globalLtsGold) || 0;

  return (
    <div className="big-cards">
      {/* Left: Claimable ETH */}
      <div className="big-card">
        <div className="big-card-header">
          <Coins size={24} className="big-card-icon" />
          <span>Claimable ETH</span>
        </div>
        <div className="big-card-value">{formatNumber(protocol.claimableEth)}</div>
        <div className="big-card-label">Protocol fees from DBXen</div>
        
        {/* Cooldown Timer - belongs here for claimFees */}
        {cooldownRemaining > 0 && (
          <div className="cooldown-timer">
            ⏰ Cooldown: {formatCooldown(cooldownRemaining)}
          </div>
        )}
        
        <button 
        className="claim-button" 
        onClick={handleClaimETH}
        disabled={claimLoading || !protocol.canClaimFees}
        >
        {claimLoading ? 'Processing...' : (protocol.canClaimFees ? 'Claim to Forge Vault' : 'Cooldown Active')}
        </button>

        {claimError && (
        <div className="claim-error-box">
            ⚠️ {claimError}
        </div>
        )}

        <div className="ticket-mint-info">
        <Zap size={14} className="ticket-icon" />
        <span>Mints 1 ticket split among DXN stakers by weight</span>
        </div>

        {/* Fee Split Breakdown */}
        <div className="fee-split-section">
          <div className="fee-split-header">Fee Distribution</div>
          <div className="fee-split-row">
            <span className="fee-label"><Trophy size={14} className="fee-icon gold" /> GOLD Stakers</span>
            <span className="fee-value">88%</span>
          </div>
          <div className="fee-split-row">
            <span className="fee-label"><Flame size={14} className="fee-icon burn" /> Buy & Burn</span>
            <span className="fee-value">8.88%</span>
          </div>
          <div className="fee-split-row">
            <span className="fee-label"><LockKeyhole size={14} className="fee-icon lts" /> Crucible (LTS)</span>
            <span className="fee-value">3.12%</span>
          </div>
        </div>
        
        {/* TODO: Remove for mainnet */}
        <div className="testnet-note">
          ℹ️ Testnet: MockDBXEN drips 0.01 ETH per claim
        </div>
      </div>

      {/* Center: Total DXN & GOLD Staked */}
      <div className="big-card center-card">
        {/* DXN Staked */}
        <div className="center-section">
          <div className="center-header">
            <Lock size={18} className="center-icon" />
            <span className="center-label">TOTAL DXN STAKED</span>
          </div>
          <div className="center-value">{formatNumber(totalDXNStaked)}</div>
          <div className="center-sublabel">Pending + Staked in Forge</div>
        </div>

        {/* Divider */}
        <div className="center-divider"></div>

        {/* DXN Locked (LTS) */}
        <div className="center-section">
          <div className="center-header">
            <LockKeyhole size={18} className="center-icon" />
            <span className="center-label">DXN IN CRUCIBLE</span>
          </div>
          <div className="center-value">{formatNumber(dxnInCrucible)}</div>
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
          <div className="center-value gold-value">{formatNumber(totalGOLDStaked)}</div>
          <div className="center-sublabel">Manual + auto-staked</div>
        </div>

        {/* Divider */}
        <div className="center-divider"></div>

        {/* GOLD Locked (LTS) */}
        <div className="center-section">
          <div className="center-header">
            <LockKeyhole size={18} className="center-icon gold-icon" />
            <span className="center-label">GOLD IN CRUCIBLE</span>
          </div>
          <div className="center-value gold-value">{formatNumber(goldInCrucible)}</div>
          <div className="center-sublabel">Long-term positions</div>
        </div>
      </div>

      {/* Right: Buy & Burn */}
      <div className="big-card">
        <div className="big-card-header">
          <Flame size={24} className="big-card-icon" />
          <span>Buy & Burn</span>
        </div>
        
        <div className="bnb-info">
          <div className="bnb-stat-row">
            <span className="bnb-label">Available ETH</span>
            <span className="bnb-value">{formatNumber(availableETH)} ETH</span>
          </div>
          
          <div className="bnb-stat-row">
            <span className="bnb-label">Tickets This Epoch</span>
            <span className="bnb-value">{formatNumber(protocol.ticketsThisEpoch)}</span>
          </div>

          <div className="bnb-stat-row highlight">
            <span className="bnb-label">Epoch Multiplier</span>
            <span className="bnb-value">{protocol.epochMultiplier}x</span>
          </div>
        </div>

        {/* Percentage selector */}
        <div className="bnb-percentage">
          <div className="bnb-percentage-buttons">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                className={`pct-btn ${burnPercentage === pct ? 'active' : ''}`}
                onClick={() => setBurnPercentage(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
          <div className="bnb-burn-amount">
            Burning: {formatNumber(ethToBurn)} ETH {burnPercentage < 100 && `(${formatNumber(availableETH - ethToBurn)} rolls over)`}
          </div>
        </div>

        <div className="bnb-note">
          ℹ️ Buys DXN at market price, burns it, and mints GOLD 1:1. Each execution ends the current epoch.
        </div>
        
        <button 
          className="claim-button" 
          onClick={handleBuyAndBurn}
          disabled={burnLoading || availableETH === 0 || protocol.ticketsThisEpoch === 0}
        >
          {burnLoading ? 'Processing...' : 'Execute Buy & Burn'}
        </button>
        
        {availableETH === 0 && (
          <div className="bnb-warning">No ETH available. Claim fees first!</div>
        )}
        {protocol.ticketsThisEpoch === 0 && availableETH > 0 && (
          <div className="bnb-warning">No tickets this epoch yet.</div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default BigCards;
