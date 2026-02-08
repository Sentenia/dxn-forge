import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Calendar, Ticket, Award, DollarSign, Coins, Info, Lightbulb, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { ethers } from 'ethers';
import NavAccordion from './NavAccordion';
import { useWallet } from '../hooks/useWallet';
import { useForgeData } from '../hooks/useForgeData';
import { CONTRACTS, FORGE_ABI, ERC20_ABI, getReadProvider } from '../contracts';
import { parseContractError, logContractError } from '../utils/contractErrors';
import './BurnXEN.css';

function BurnXEN({ onNavigate }) {
  const { address, connected } = useWallet();
  const { protocol, user, refetch } = useForgeData();

  const [batches, setBatches] = useState(1);
  const [loading, setLoading] = useState(false);
  const [burnStats, setBurnStats] = useState({
    totalXenBurned: 0,
    userXenBurned: 0,
    xenFees: 0,
  });
  const [feeData, setFeeData] = useState({
    fee: '0',
    discount: 0,
  });
  const [xenBalance, setXenBalance] = useState('0');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (type, message) => setToast({ show: true, type, message });

  // Constants
  const xenPerBatch = 2500000;
  const xenToBurn = batches * xenPerBatch;
  const ticketsEarned = batches / 10000;

  // Fetch burn stats and XEN balance
  useEffect(() => {
    async function fetchBurnStats() {
      if (!window.ethereum) return;
      
      try {
        const provider = getReadProvider();
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, provider);
        const xen = new ethers.Contract(CONTRACTS.tXEN, ERC20_ABI, provider);
        
        const [totalBurned, fees] = await Promise.all([
          forge.xenBurned(),
          forge.xenFees(),
        ]);
        
        setBurnStats({
          totalXenBurned: parseFloat(ethers.formatEther(totalBurned)),
          xenFees: parseFloat(ethers.formatEther(fees)),
        });

        // Fetch user XEN balance if connected
        if (connected && address) {
          const [userBurned, balance] = await Promise.all([
            forge.userXenBurned(address),
            xen.balanceOf(address),
          ]);
          setBurnStats(prev => ({
            ...prev,
            userXenBurned: parseFloat(ethers.formatEther(userBurned)),
          }));
          setXenBalance(ethers.formatEther(balance));
        }
      } catch (err) {
        console.error('Error fetching burn stats:', err);
      }
    }
    
    fetchBurnStats();
  }, [connected, address]);

  // Calculate fee when batches change
  useEffect(() => {
    async function calcFee() {
      if (batches === 0) return;
      
      try {
        const provider = getReadProvider();
        const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, provider);
        
        const [fee, disc] = await forge.calcFee(batches);
        
        setFeeData({
          fee: ethers.formatEther(fee),
          discount: Number(disc) / 100, // disc is in basis points * 100
        });
      } catch (err) {
        console.error('Error calculating fee:', err);
      }
    }
    
    calcFee();
  }, [batches]);

  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  // Format tickets with fixed decimal places (won't round small values to 0)
  const fmtTickets = (num, decimals = 4) => {
    const val = parseFloat(num);
    if (isNaN(val)) return '0';
    if (val === 0) return '0';
    return val.toFixed(decimals);
  };

  const handleBurn = async () => {
    if (!connected) return;

    // Check XEN balance
    const requiredXen = batches * xenPerBatch;
    if (parseFloat(xenBalance) * 1e18 < requiredXen * 1e18) {
      showToast('error', 'Insufficient XEN balance');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
      const xen = new ethers.Contract(CONTRACTS.tXEN, ERC20_ABI, signer);

      // Check allowance
      const allowance = await xen.allowance(address, CONTRACTS.DXNForge);
      const requiredAmount = ethers.parseEther((batches * xenPerBatch).toString());

      if (allowance < requiredAmount) {
        const approveTx = await xen.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
        await approveTx.wait();
      }

      // Calculate fee
      const [fee] = await forge.calcFee(batches);

      // Burn XEN
      const tx = await forge.burnXEN(batches, { value: fee });
      await tx.wait();

      showToast('success', `Burned ${(batches * xenPerBatch).toLocaleString()} XEN for ${ticketsEarned.toFixed(4)} tickets`);
      refetch(true);

      // Refresh burn stats
      const [totalBurned, userBurned] = await Promise.all([
        forge.xenBurned(),
        forge.userXenBurned(address),
      ]);
      setBurnStats(prev => ({
        ...prev,
        totalXenBurned: parseFloat(ethers.formatEther(totalBurned)),
        userXenBurned: parseFloat(ethers.formatEther(userBurned)),
      }));

    } catch (err) {
      logContractError('Burn XEN', err);
      showToast('error', parseContractError(err));
    } finally {
      setLoading(false);
    }
  };

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  // User tickets from hook
  const userTicketsThisEpoch = parseFloat(user.totalTickets) || 0;
  const userPendingFromStaking = parseFloat(user.pendingTickets) || 0;

  return (
    <div className="burn-page">
      {/* Hero Section */}
      <div className="burn-hero">
        <h1><Flame size={48} style={{display: 'inline', marginBottom: '-8px', marginRight: '12px'}} /> Burn XEN for Tickets</h1>
        <p>Burn XEN in 2.5M batches to earn tickets for DXN GOLD distribution</p>
      </div>

      {/* Navigation */}
      <NavAccordion currentPage="burn" onNavigate={onNavigate} />

      {/* Info Cards */}
      <div className="burn-info-cards">
        <div className="burn-info-card">
          <div className="burn-card-header">
            <Flame size={20} className="burn-card-icon" />
            <span>Total XEN Burned</span>
          </div>
          <div className="burn-card-value">{formatLargeNumber(burnStats.totalXenBurned)}</div>
          <div className="burn-card-label">All-time burned</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Calendar size={20} className="burn-card-icon" />
            <span>Current Cycle</span>
          </div>
          <div className="burn-card-value">{protocol.currentCycle}</div>
          <div className="burn-card-label">24h per cycle</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Ticket size={20} className="burn-card-icon" />
            <span>Epoch Tickets</span>
          </div>
          <div className="burn-card-value">{fmtTickets(protocol.ticketsThisEpoch, 4)}</div>
          <div className="burn-card-label">This epoch total</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Award size={20} className="burn-card-icon" />
            <span>Your Epoch Tickets</span>
          </div>
          <div className="burn-card-value">{formatNumber(userTicketsThisEpoch)}</div>
          <div className="burn-card-label">From XEN burns this epoch</div>
        </div>
      </div>

      {/* Burn Interface */}
      <div id="burn-user-actions" className="burn-interface">
        <div className="burn-card-large">
          <div className="burn-card-large-header">
            <Flame size={32} className="burn-header-icon" />
            <div className="burn-header-text">
              <h3>Burn XEN</h3>
              <p>Burn XEN tokens to earn tickets for GOLD distribution</p>
            </div>
          </div>

          {/* Batch Slider */}
          <div className="batch-slider-section">
            <div className="slider-header">
              <label>Number of Batches</label>
              <div className="info-icon-wrapper">
                <span className="info-icon-trigger"><Info size={16} /></span>
                <div className="info-tooltip">
                  Each batch burns 2.5M XEN. More batches in one transaction = bigger fee discount (up to 50% at 10,000 batches).
                </div>
              </div>
            </div>
            
            <div className="slider-wrapper">
              <input
                type="range"
                min="1"
                max="10000"
                value={batches}
                onChange={(e) => setBatches(parseInt(e.target.value))}
                className="batch-slider"
              />
              <div className="batch-value">
                <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="10000"
                    value={batches}
                    onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setBatches(Math.min(Math.max(val, 1), 10000));
                    }}
                    className="batch-input"
                />
                </div>
            </div>

            <div className="slider-minmax">
              <span>Min: 1</span>
              <span>Max: 10,000</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="burn-stats-grid">
            <div className="burn-stat-item">
            <Flame size={20} className="stat-icon" />
            <div className="stat-content">
                <span className="stat-label">XEN to Burn</span>
                <span className="stat-value">{(xenToBurn).toLocaleString()}</span>
            </div>
            </div>

            <div className="burn-stat-item">
            <TrendingDown size={20} className="stat-icon" />
            <div className="stat-content">
                <span className="stat-label">Batch Discount</span>
                <span className="stat-value green">{feeData.discount.toFixed(2)}%</span>
            </div>
            </div>
          </div>

          {/* Burn Summary — XEN balance included as first row */}
          <div className="burn-summary">
            {connected && (
              <div className="summary-row xen-balance-row">
                <span className="summary-label"><Coins size={14} style={{display: 'inline', marginRight: '4px'}} /> Your XEN Balance</span>
                <span className="summary-value">{parseFloat(xenBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })} XEN</span>
              </div>
            )}
            <div className="summary-row highlight">
              <span className="summary-label">Tickets Earned</span>
              <span className="summary-value">{ticketsEarned.toFixed(4)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">XEN Required</span>
              <span className="summary-value">{xenToBurn.toLocaleString()} XEN</span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><DollarSign size={14} style={{display: 'inline', marginRight: '4px'}} /> Protocol Fee</span>
              <span className="summary-value">{parseFloat(feeData.fee).toFixed(6)} ETH</span>
            </div>
          </div>

          {/* Burn Button */}
          <button 
            className="burn-submit-btn" 
            onClick={handleBurn}
            disabled={loading || !connected}
          >
            <Flame size={20} style={{marginRight: '8px'}} />
            {loading ? 'Burning...' : (connected ? `Burn ${batches.toLocaleString()} Batch(es)` : 'Connect Wallet to Burn')}
          </button>

          {/* Info Note */}
          <div className="burn-note">
            <Lightbulb size={16} style={{display: 'inline', marginRight: '6px', marginBottom: '-3px'}} />
            <strong>How it works:</strong> Tickets scale linearly: 1 batch = 0.0001 ticket, 10,000 batches = 1 ticket. 
            Tickets earn GOLD from the 8.88% buy & burn bucket. All GOLD is auto-staked and earns from 88% of protocol ETH fees.
            </div>
        </div>
      </div>

      {/* Your Burn Stats */}
      {connected && burnStats.userXenBurned > 0 && (
        <div className="user-burn-stats">
          <h3>Your Burn History</h3>
          <div className="user-stats-grid">
            <div className="user-stat-item">
              <span className="stat-label">XEN You've Burned</span>
              <span className="stat-value">{formatLargeNumber(burnStats.userXenBurned)}</span>
            </div>
            <div className="user-stat-item">
              <span className="stat-label">Your Total Tickets</span>
              <span className="stat-value">{formatNumber(userTicketsThisEpoch)}</span>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h3>How XEN Burning Works</h3>
        <div className="works-grid">
          <div className="works-card">
            <div className="works-number">1</div>
            <h4>Burn XEN Batches</h4>
            <p>
              Burn XEN in 2.5M batches. Each 10,000 batches = 1 ticket. Tickets scale linearly, so 1 batch = 0.0001 ticket.
              Burn multiple times for more tickets—no cap!
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">2</div>
            <h4>Earn Tickets</h4>
            <p>
              Tickets give you a share of GOLD minted from the 8.88% buy & burn bucket. 
              More tickets = larger share of GOLD distribution each cycle.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">3</div>
            <h4>GOLD Auto-Staked</h4>
            <p>
              All GOLD earned is automatically staked. Your staked GOLD earns from 88% of protocol ETH fees.
              Claim ETH rewards anytime from your staked GOLD position.
            </p>
          </div>

          <div className="works-card">
            <div className="works-number">4</div>
            <h4>Batch Discount</h4>
            <p>
              Burning more batches in one transaction gives you a protocol fee discount up to 50% at 10,000 batches.
              Save on fees by burning in bulk!
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && createPortal(
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>,
        document.body
      )}
    </div>
  );
}

export default BurnXEN;