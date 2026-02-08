import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, Lock, Unlock, Info, Trophy, Gift, Coins, Ticket, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { useForgeData } from '../hooks/useForgeData';
import { CONTRACTS, FORGE_ABI, ERC20_ABI } from '../contracts';
import { parseContractError, logContractError, extractErrorSelector } from '../utils/contractErrors';
import InfoModal from './InfoModal';


function UserActions() {
  const { address, connected } = useWallet();
  const { user, protocol, refetch } = useForgeData();

  // DXN staking state
  const [dxnTab, setDxnTab] = useState('stake');
  const [dxnAmount, setDxnAmount] = useState('');
  const [dxnLoading, setDxnLoading] = useState(false);

  // GOLD staking state
  const [goldTab, setGoldTab] = useState('stake');
  const [goldAmount, setGoldAmount] = useState('');
  const [goldLoading, setGoldLoading] = useState(false);

  // Claim loading
  const [claimLoading, setClaimLoading] = useState(false);
  const [pokeLoading, setPokeLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Info modal state (for friendly error explanations)
  const [infoModal, setInfoModal] = useState({ show: false, title: '', message: '', details: [] });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type, message) => {
    console.log('[showToast] Setting toast:', { type, message });
    setToast({ show: true, type, message });
  };

  // Parse user data
  const userDxnBalance = parseFloat(user.dxnBalance) || 0;
  const userDxnStaked = parseFloat(user.dxnStaked) || 0;
  const userDxnPending = parseFloat(user.dxnPending) || 0;
  const userGoldBalance = parseFloat(user.goldBalance) || 0;
  const userGoldStaked = parseFloat(user.manualGoldStaked) || 0;
  const userGoldPending = parseFloat(user.manualGoldPending) || 0;
  const userGoldAutoStaked = parseFloat(user.autoStakedGold) || 0;
  const autoStakedGold = parseFloat(user.autoStakedGold) || 0;
  // Total unstakeable GOLD = manual staked + auto staked (excludes pending)
  const totalUnstakeableGold = userGoldStaked + userGoldAutoStaked;
  const pendingGoldReward = parseFloat(user.pendingGoldReward) || 0;
  const claimableETH = parseFloat(user.pendingEth) || 0;
  const userTicketsFromStaking = parseFloat(user.pendingTickets) || 0;
  const userTicketsFromBurns = parseFloat(user.totalTickets) || 0;
  const userTotalTickets = userTicketsFromStaking + userTicketsFromBurns;

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  // Get signer for transactions
  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  };

  // DXN handlers
  const handleDxnMax = () => {
    if (dxnTab === 'stake') {
      setDxnAmount(userDxnBalance.toString());
    } else {
      setDxnAmount(userDxnStaked.toString());
    }
  };

  const handleDxnAction = async () => {
    if (!connected || !dxnAmount || Number(dxnAmount) <= 0) return;

    setDxnLoading(true);
    try {
      const signer = await getSigner();
      const amount = ethers.parseEther(dxnAmount);

      if (dxnTab === 'stake') {
        // Check allowance first
        const dxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, signer);
        const allowance = await dxn.allowance(address, CONTRACTS.DXNForge);

        if (allowance < amount) {
          const approveTx = await dxn.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
          await approveTx.wait();
        }

        // Stake
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
        const tx = await forge.stakeDXN(amount);
        await tx.wait();
        showToast('success', `Staked ${dxnAmount} DXN`);
      } else {
        // Unstake
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
        const tx = await forge.unstakeDXN(amount);
        await tx.wait();
        showToast('success', `Unstaked ${dxnAmount} DXN`);
      }

      setDxnAmount('');
      refetch(true);
    } catch (err) {
      logContractError('DXN action', err);
      showToast('error', parseContractError(err));
    } finally {
      setDxnLoading(false);
    }
  };

  // GOLD handlers
  const handleGoldMax = () => {
    if (goldTab === 'stake') {
      setGoldAmount(userGoldBalance.toString());
    } else {
      // MAX unstake = manual staked + auto staked (not pending)
      setGoldAmount(totalUnstakeableGold.toString());
    }
  };

  const handleGoldAction = async () => {
    if (!connected || !goldAmount || Number(goldAmount) <= 0) return;

    setGoldLoading(true);
    try {
      const signer = await getSigner();
      const amount = ethers.parseEther(goldAmount);

      if (goldTab === 'stake') {
        // Check allowance first
        const gold = new ethers.Contract(CONTRACTS.GOLDToken, ERC20_ABI, signer);
        const allowance = await gold.allowance(address, CONTRACTS.DXNForge);

        if (allowance < amount) {
          const approveTx = await gold.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
          await approveTx.wait();
        }

        // Stake
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
        const tx = await forge.stakeGold(amount);
        await tx.wait();
        showToast('success', `Staked ${goldAmount} GOLD`);
      } else {
        // Unstake
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
        const tx = await forge.unstakeGold(amount);
        await tx.wait();
        showToast('success', `Unstaked ${goldAmount} GOLD`);
      }

      setGoldAmount('');
      refetch(true);
    } catch (err) {
      logContractError('GOLD action', err);
      showToast('error', parseContractError(err));
    } finally {
      setGoldLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!connected) return;

    setClaimLoading(true);
    try {
      const signer = await getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);

      // Pre-flight check: verify there's something to claim before sending tx
      const [gold, eth] = await Promise.all([
        forge.autoGold(address),
        forge.pendEth(address),
      ]);

      if (gold === 0n && eth === 0n) {
        showToast('warning', 'No rewards available yet — stake DXN/GOLD and wait for Buy & Burn');
        setClaimLoading(false);
        return;
      }

      const tx = await forge.claimRewards();
      await tx.wait();
      showToast('success', 'Rewards claimed successfully');
      refetch(true);
    } catch (err) {
      logContractError('Claim rewards', err);
      const errorMessage = parseContractError(err);
      showToast('error', errorMessage);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleClaimEth = async () => {
    if (!connected) return;

    setClaimLoading(true);
    try {
      const signer = await getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
      const tx = await forge.claimEth();
      await tx.wait();
      showToast('success', 'ETH claimed successfully');
      refetch(true);
    } catch (err) {
      logContractError('Claim ETH', err);
      showToast('error', parseContractError(err));
    } finally {
      setClaimLoading(false);
    }
  };

  const handlePoke = async () => {
    if (!connected) return;

    setPokeLoading(true);
    try {
      const signer = await getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
      const tx = await forge.sync();
      await tx.wait();
      showToast('success', 'Synced successfully');
      refetch(true);
    } catch (err) {
      logContractError('Sync', err);
      showToast('error', parseContractError(err));
    } finally {
      setPokeLoading(false);
    }
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
          <button 
            className="sync-button-inline"
            onClick={handlePoke}
            disabled={pokeLoading || !connected}
            title="Syncs your pending to staked for DXN & GOLD.  Upddates UI with on-chain status."
          >
            <RefreshCw size={14} className={pokeLoading ? 'spinning' : ''} />
            <span>{pokeLoading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Currently Staked Display */}
        <div className="currently-staked">
          <div className="staked-row">
            <span className="staked-label">Pending:</span>
            <span className="staked-amount">{formatNumber(userDxnPending)} DXN</span>
          </div>
          <div className="staked-row">
            <span className="staked-label">Staked:</span>
            <span className="staked-amount">{formatNumber(userDxnStaked)} DXN</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="stake-tabs">
          <button 
            className={`stake-tab ${dxnTab === 'stake' ? 'active' : ''}`}
            onClick={() => setDxnTab('stake')}
          >
            <Lock size={16} style={{display: 'inline', marginRight: '4px'}} /> Stake
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
              ? `Balance: ${formatNumber(userDxnBalance)} DXN` 
              : `Staked: ${formatNumber(userDxnStaked)} DXN`
            }
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="stake-action-btn" 
          onClick={handleDxnAction}
          disabled={dxnLoading || !connected}
        >
          {dxnLoading ? 'Processing...' : (dxnTab === 'stake' ? 'Stake DXN' : 'Unstake DXN')}
        </button>

        {/* Warning */}
        <div className="stake-warning dxn-warning">
        <Info size={16} style={{display: 'inline', marginRight: '6px', marginBottom: '-2px'}} /> 
        DXN uses DBXen's lock+2 rule: Staked DXN locks until two cycles complete
        </div>

        {/* Your Tickets Info Card */}
        <div className="tickets-info-card">
          <div className="tickets-header">
            <Ticket size={24} className="tickets-icon" />
            <span>Your Tickets This Epoch</span>
          </div>
          <div className="tickets-total">
            {formatNumber(userTotalTickets)}
          </div>
          <div className="tickets-breakdown">
            <div className="tickets-row">
              <span>From DXN Staking</span>
              <span>{formatNumber(userTicketsFromStaking)}</span>
            </div>
            <div className="tickets-row">
              <span>From XEN Burns</span>
              <span>{formatNumber(userTicketsFromBurns)}</span>
            </div>
          </div>
          <div className="tickets-hint">
            Tickets convert to GOLD at epoch end via Buy & Burn
          </div>
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
            <span className="staked-label">Manual Pending:</span>
            <span className="staked-amount">{formatNumber(userGoldPending)} GOLD</span>
          </div>
          <div className="staked-row">
            <span className="staked-label">Manual Staked:</span>
            <span className="staked-amount">{formatNumber(userGoldStaked)} GOLD</span>
          </div>
          <div className="staked-row">
            <span className="staked-label">Auto-Staked:</span>
            <span className="staked-amount">{formatNumber(autoStakedGold + pendingGoldReward)} GOLD</span>
            </div>
        </div>

        {/* Tab Buttons */}
        <div className="stake-tabs">
          <button 
            className={`stake-tab ${goldTab === 'stake' ? 'active' : ''}`}
            onClick={() => setGoldTab('stake')}
          >
            <Lock size={16} style={{display: 'inline', marginRight: '4px'}} /> Stake
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
            max={goldTab === 'stake' ? userGoldBalance : totalUnstakeableGold}
            step="0.0001"
            value={goldAmount || 0}
            onChange={(e) => setGoldAmount(e.target.value)}
            className="stake-slider gold"
          />
          <div className="slider-value gold">{Number(goldAmount || 0).toFixed(4)} GOLD</div>
          
          {goldTab === 'unstake' && (
            <div className="unstake-tooltip">
              <Info size={16} style={{display: 'inline', marginRight: '4px'}} /> Can't unstake recently staked GOLD until next cycle completes
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="stake-input-section">
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
              ? `Balance: ${formatNumber(userGoldBalance)} GOLD`
              : `Unstakeable: ${formatNumber(totalUnstakeableGold)} GOLD`
            }
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="stake-action-btn gold" 
          onClick={handleGoldAction}
          disabled={goldLoading || !connected}
        >
          {goldLoading ? 'Processing...' : (goldTab === 'stake' ? 'Stake GOLD' : 'Unstake GOLD')}
        </button>

        {/* GOLD Locking Disclaimer */}
        <div className="stake-warning gold-warning">
          <Info size={16} style={{display: 'inline', marginRight: '6px', marginBottom: '-2px'}} /> GOLD uses DBXen's lock+1 rule: Staked GOLD locks until the next cycle completes
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
              <Coins size={20} className="reward-icon" style={{color: '#f5a623'}} />
              <div className="reward-details">
                <span className="reward-label">Auto-Staked & Claimable GOLD</span>
                <span className="reward-value">{formatNumber(pendingGoldReward + autoStakedGold)}</span>
              </div>
            </div>
          </div>

          <div className="reward-item">
            <div className="reward-info">
              <Coins size={20} className="reward-icon" style={{color: '#10b981'}} />
              <div className="reward-details">
                <span className="reward-label">ETH Fees</span>
                <span className="reward-value">{formatNumber(claimableETH)}</span>
              </div>
            </div>
            <button 
              className="reward-claim" 
              onClick={handleClaimEth}
              disabled={claimLoading || claimableETH === 0}
            >
              Claim
            </button>
          </div>
        </div>

        <button
          className="action-button"
          onClick={handleClaimRewards}
          disabled={claimLoading || !connected}
        >
          {claimLoading ? 'Processing...' : 'Claim All Rewards'}
        </button>
      </div>

      {/* Toast Notification - Portal to body to escape stacking context */}
      {toast.show && createPortal(
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <XCircle size={18} />}
          {toast.type === 'warning' && <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}

      {/* Info Modal for friendly error explanations */}
      <InfoModal
        isOpen={infoModal.show}
        onClose={() => setInfoModal({ show: false, title: '', message: '', details: [] })}
        title={infoModal.title}
        message={infoModal.message}
        details={infoModal.details}
      />
    </div>
  );
}

export default UserActions;