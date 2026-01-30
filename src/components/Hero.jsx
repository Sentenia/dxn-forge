import React, { useState, useEffect } from 'react';
import { Clock, Zap, Gem, AlertTriangle } from 'lucide-react';
import './Hero.css';

function Hero({ onNavigate }) {
  const [countdown, setCountdown] = useState('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setUTCHours(24, 0, 0, 0);
      
      const timeRemaining = Math.max(0, (nextMidnight - now) / 1000);
      
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = Math.floor(timeRemaining % 60);
      
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-section">

      {/* Title Section */}
      <div className="hero-title">
        <h1>DXN Forge</h1>
        <p>Stake your DXN to Mint DXN GOLD</p>
        <div className="countdown-timer">
          <Clock size={20} className="timer-icon" />
          <span>Claim fees in:</span>
          <span className="timer-value">{countdown}</span>
        </div>
      </div>

      {/* Promo Cards Grid */}
      <div className="promo-grid">
        {/* Card 1: Epoch Bonus - Scrolls to stake section */}
        <div className="promo-card clickable" onClick={() => {
          const stakingSection = document.querySelector('.user-actions');
          if (stakingSection) {
            stakingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}>
          <div className="promo-badge">LIMITED TIME</div>
          <h3 className="promo-title">10x Ticket Bonus</h3>
          <p className="promo-text">
            Epochs 1-25: Early stakers earn bonus tickets! Starts at <strong>10x</strong> and decreases linearly to 1x.
          </p>
          <div className="promo-stats">
            <div className="stat">
              <span className="stat-label">Current Epoch</span>
              <span className="stat-value">7</span>
            </div>
            <div className="stat">
              <span className="stat-label">Current Bonus</span>
              <span className="stat-value highlight">7.8x</span>
            </div>
          </div>
          <div className="promo-note">
            <AlertTriangle size={14} style={{display: 'inline', marginRight: '4px'}} /> DXN locked until Epoch 26
          </div>
        </div>

        {/* Card 2: Long-Term Staking - Navigates to longterm page */}
        <div className="promo-card clickable" onClick={() => {
          onNavigate('longterm');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <div className="promo-badge diamond"><Gem size={14} style={{display: 'inline', marginRight: '4px'}} /> DIAMOND HANDS</div>
          <h3 className="promo-title">Long-Term Staking</h3>
          <p className="promo-text">
            Starting <strong>Epoch 26</strong>: Lock DXN or GOLD for 1000-5000 days and earn from exclusive ETH pools.
          </p>
          
          <div className="lock-tiers">
            <div className="tier">1000d</div>
            <div className="tier">2000d</div>
            <div className="tier">3000d</div>
            <div className="tier">4000d</div>
            <div className="tier highlight">5000d</div>
          </div>

          <div className="promo-benefits">
            <div className="benefit">✅ Exclusive ETH rewards</div>
            <div className="benefit">✅ Higher tier = more weight</div>
            <div className="benefit">✅ No dilution after lock</div>
          </div>

          <div className="promo-warning">
            ⏰ Opens Epoch 26, closes Epoch 51
          </div>

          <button 
            className="promo-btn primary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onNavigate('longterm');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Commit Your DXN or GOLD →
          </button>
        </div>

        {/* Card 3: Burn XEN - Navigates to burn page */}
        <div className="promo-card clickable" onClick={() => {
          onNavigate('burn');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <Zap size={40} className="promo-icon" />
          <h3 className="promo-title">Burn XEN for Tickets</h3>
          <p className="promo-text">
            Burn XEN in batches of <strong>2.5M</strong> to earn tickets for GOLD distribution. Tickets scale linearly: 10,000 batches = 1 ticket.
          </p>
          
          <div className="burn-info">
            <div className="burn-stat">
              <span className="burn-label">Batch Size</span>
              <span className="burn-value">2.5M XEN</span>
            </div>
            <div className="burn-stat">
              <span className="burn-label">Max Ticket</span>
              <span className="burn-value">10K batches</span>
            </div>
          </div>

          <div className="promo-note">
            💡 Tickets earn GOLD from 8.88% buy & burn
          </div>

          <button 
            className="promo-btn secondary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onNavigate('burn');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Burn XEN Now →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;