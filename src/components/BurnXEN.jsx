import React, { useState } from 'react';
import { Flame, Calendar, Ticket, Award, DollarSign } from 'lucide-react';
import './BurnXEN.css';

function BurnXEN() {
  const [batches, setBatches] = useState(1);

  // Mock data
  const totalXenBurned = 14080000000; // 14.08T
  const currentCycle = 1041;
  const dailyTickets = 1249;
  const userPendingTickets = 127;
  const userTotalTickets = 3842;
  
  // Burn calculation
  const xenPerBatch = 2500000;
  const xenToBurn = batches * xenPerBatch;
  const gasPrice = 0.071; // Gwei - this is MOCK data, real implementation will use live gas price API
  
  // Mock prices - real implementation will fetch from DEX/oracle
  const xenPriceUSD = 0.00000000855; // Current XEN price on Ethereum
  const ethPriceUSD = 3500; // $3500 per ETH (mock)
  
  // Calculate XEN cost in USD
  const xenCostUSD = xenToBurn * xenPriceUSD;
  
  // Ticket calculation: Linear scale from 1 batch = 0.0001 ticket to 10000 batches = 1 ticket
  const ticketsEarned = batches / 10000;
  
  // DBXen Protocol Fee Formula (corrected):
  // ProtocolFee = GasPerBatch × (1 - 0.00005 × NumberOfBatches) × NumberOfBatches
  // 
  // Working backwards from actual DBXen data:
  // 10 batches = 0.0001 ETH, discount = -0.05%
  // 1000 batches = 0.0114 ETH, discount = -5%
  // 5000 batches = 0.0450 ETH, discount = -25%
  // 10000 batches = 0.0600 ETH, discount = -50%
  
  // Solving for GasPerBatch:
  // At 10000 batches: 0.0600 = GPB × 0.5 × 10000
  // GPB = 0.0600 / 5000 = 0.000012 ETH
  
  const gasPerBatch = 0.000012; // ETH per batch (this encapsulates the base gas cost)
  
  // Apply DBXen discount formula
  const discountFactor = Math.max(0, 1 - (0.00005 * batches)); // Cap at 50% (when batches >= 20000)
  const protocolFee = gasPerBatch * discountFactor * batches;
  
  // Calculate discount percentage for display
  const discountPercent = Math.min(50, (0.00005 * batches) * 100); // Cap at 50%
  const batchDiscount = batches > 1 ? `-${discountPercent.toFixed(2)}%` : '0%';
  
  const protocolFeeUSD = protocolFee * ethPriceUSD;
  
  // Total cost in USD
  const totalCostUSD = xenCostUSD + protocolFeeUSD;

  const handleBurn = () => {
    alert(`Mock: Burning ${batches} batch(es) = ${xenToBurn.toLocaleString()} XEN!\n\nYou'll earn ${ticketsEarned.toFixed(4)} ticket(s) for GOLD distribution.`);
  };

  return (
    <div className="burn-page">
      {/* Hero Section */}
      <div className="burn-hero">
        <h1><Flame size={48} style={{display: 'inline', marginBottom: '-8px', marginRight: '12px'}} /> Burn XEN for Tickets</h1>
        <p>Burn XEN in 2.5M batches to earn tickets for DXN GOLD distribution</p>
      </div>

      {/* Info Cards */}
      <div className="burn-info-cards">
        <div className="burn-info-card">
          <div className="burn-card-header">
            <Flame size={20} className="burn-card-icon" />
            <span>Total XEN Burned</span>
          </div>
          <div className="burn-card-value">{(totalXenBurned / 1000000000000).toFixed(2)}T</div>
          <div className="burn-card-label">All-time burned</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Calendar size={20} className="burn-card-icon" />
            <span>Current Cycle</span>
          </div>
          <div className="burn-card-value">{currentCycle}</div>
          <div className="burn-card-label">24h per cycle</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Ticket size={20} className="burn-card-icon" />
            <span>Daily Tickets</span>
          </div>
          <div className="burn-card-value">{dailyTickets.toLocaleString()}</div>
          <div className="burn-card-label">This cycle mints</div>
        </div>

        <div className="burn-info-card">
          <div className="burn-card-header">
            <Award size={20} className="burn-card-icon" />
            <span>Your Pending Tickets</span>
          </div>
          <div className="burn-card-value">{userPendingTickets}</div>
          <div className="burn-card-label">Total earned: {userTotalTickets.toLocaleString()}</div>
        </div>
      </div>

      {/* Burn Interface */}
      <div className="burn-interface">
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
              <div className="info-icon" title="Each batch = 2.5M XEN. More batches = gas discount!">ℹ️</div>
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
              <div className="batch-value">{batches.toLocaleString()}</div>
            </div>

            <div className="slider-minmax">
              <span>Min: 1</span>
              <span>Max: 10,000</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="burn-stats-grid">
            <div className="burn-stat-item">
              <span className="stat-icon">⛽</span>
              <div className="stat-content">
                <span className="stat-label">Gas Price</span>
                <span className="stat-value green">{gasPrice} Gwei (low)</span>
              </div>
            </div>

            <div className="burn-stat-item">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <span className="stat-label">Batch Discount</span>
                <span className="stat-value">{batchDiscount}</span>
              </div>
            </div>
          </div>

          {/* Burn Summary */}
          <div className="burn-summary">
            <div className="summary-row highlight">
              <span className="summary-label">Tickets Earned</span>
              <span className="summary-value">{ticketsEarned.toFixed(4)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">XEN to Burn</span>
              <span className="summary-value">{xenToBurn.toLocaleString()} <span className="value-unit">(${xenCostUSD.toFixed(2)})</span></span>
            </div>
            <div className="summary-row">
              <span className="summary-label"><DollarSign size={14} style={{display: 'inline', marginRight: '4px'}} /> Protocol Fee</span>
              <span className="summary-value">{protocolFee.toFixed(4)} ETH <span className="value-unit">(~${protocolFeeUSD.toFixed(2)})</span></span>
            </div>
            <div className="summary-row total">
              <span className="summary-label"><strong>Total Cost</strong></span>
              <span className="summary-value"><strong>${totalCostUSD.toFixed(2)} USD</strong></span>
            </div>
          </div>

          {/* Burn Button */}
          <button className="burn-submit-btn" onClick={handleBurn}>
            <Flame size={20} style={{marginRight: '8px'}} />
            Connect Wallet to Burn
          </button>

          {/* Info Note */}
          <div className="burn-note">
            💡 <strong>How it works:</strong> Tickets scale linearly: 1 batch = 0.0001 ticket, 10,000 batches = 1 ticket. 
            Tickets earn GOLD from the 8.88% buy & burn bucket. All GOLD is auto-staked and earns from 90% of protocol ETH fees.
          </div>
        </div>
      </div>

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
              All GOLD earned is automatically staked. Your staked GOLD earns from 90% of protocol ETH fees.
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
    </div>
  );
}

export default BurnXEN;