import React, { useState, useEffect } from 'react';
import { Clock, Zap, Gem, ChevronDown, ChevronUp, Lock, Flame, Coins, Percent, Droplets, BookOpen, CheckCircle, Lightbulb, BarChart3, Target } from 'lucide-react';
import { useForgeData } from '../hooks/useForgeData';
import './Hero.css';

function Hero({ onNavigate }) {
  const { protocol, user } = useForgeData();
  const [countdown, setCountdown] = useState('00:00:00');
  const [expandedCard, setExpandedCard] = useState(null);
  const [statsExpanded, setStatsExpanded] = useState(() => {
    const saved = localStorage.getItem('hero-stats-expanded');
    return saved !== null ? saved === 'true' : false; // Default collapsed
  });

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('hero-stats-expanded', String(newState));
  };

  const getBonus = (epoch) => {
    if (epoch <= 25) {
      const multiplier = 10 - ((epoch - 1) * (9 / 24));
      return Math.max(1, Math.round(multiplier * 10) / 10);
    }
    return 1;
  };

  const currentBonus = getBonus(protocol.currentEpoch);

  useEffect(() => {
    const updateCountdown = () => {
      let targetTime;
      if (protocol.lastClaimFeesTime && protocol.lastClaimFeesTime > 0) {
        targetTime = (protocol.lastClaimFeesTime + 86400) * 1000;
      } else {
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setUTCHours(24, 0, 0, 0);
        targetTime = nextMidnight.getTime();
      }
      
      const now = Date.now();
      const timeRemaining = Math.max(0, (targetTime - now) / 1000);
      
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
  }, [protocol.lastClaimFeesTime]);

  const toggleCard = (card) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  // Calculate user's total GOLD holdings
  const userTotalGold =
    parseFloat(user.goldBalance || 0) +
    parseFloat(user.autoStakedGold || 0) +
    parseFloat(user.manualGoldStaked || 0);

  // Calculate percentage of total supply
  const goldSupply = parseFloat(protocol.goldTotalSupply || 0);
  const userGoldPercent = goldSupply > 0 ? (userTotalGold / goldSupply) * 100 : 0;

  // Format large numbers
  const formatNumber = (num, decimals = 2) => {
    const n = parseFloat(num);
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + 'K';
    return n.toFixed(decimals);
  };

  return (
    <div className="hero-section">
      {/* Title Section */}
      <div className="hero-title-container">
        {/* Center Title */}
        <div className="hero-title">
          <h1>DXN Forge</h1>
          <p>Stake your DXN to Mint DXN GOLD</p>
          <div className="countdown-timer">
            <Clock size={20} className="timer-icon" />
            <span>Claim fees in:</span>
            <span className="timer-value">{countdown}</span>
          </div>

          {/* Stats Toggle */}
          <button className="stats-toggle" onClick={toggleStats}>
            <span>Stats</span>
            {statsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Collapsible Stats Section */}
      <div className={`hero-stats-wrapper ${statsExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="hero-stats-container">
          {/* Row 1 */}
          <div className="hero-stat-card stat-left">
            <Lock size={16} className="hero-stat-icon" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Total DXN Staked</span>
              <span className="hero-stat-value">{formatNumber(protocol.totalDXNStaked)}</span>
            </div>
          </div>
          <div className="hero-stat-card stat-right">
            <Coins size={16} className="hero-stat-icon gold" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Your GOLD</span>
              <span className="hero-stat-value gold">{formatNumber(userTotalGold, 4)}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="hero-stat-card stat-left">
            <Flame size={16} className="hero-stat-icon fire" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Total DXN Burned</span>
              <span className="hero-stat-value">{formatNumber(protocol.goldTotalSupply)}</span>
            </div>
          </div>
          <div className="hero-stat-card stat-right">
            <Percent size={16} className="hero-stat-icon gold" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Supply Share</span>
              <span className="hero-stat-value gold">{userGoldPercent.toFixed(4)}%</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="hero-stat-card stat-left">
            <Flame size={16} className="hero-stat-icon xen" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Total XEN Burned</span>
              <span className="hero-stat-value">{formatNumber(protocol.totalXenBurned)}</span>
            </div>
          </div>
          <div className="hero-stat-card stat-right">
            <Droplets size={16} className="hero-stat-icon eth" />
            <div className="hero-stat-content">
              <span className="hero-stat-label">Claimable ETH</span>
              <span className="hero-stat-value eth">{parseFloat(user.pendingEth || 0).toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Info Cards */}
      <div className="info-accordion">
        
        {/* Card 1: Stake DXN */}
        <div className={`accordion-card ${expandedCard === 'stake' ? 'expanded' : ''}`}>
          <button 
            className="accordion-header"
            onClick={() => toggleCard('stake')}
          >
            <div className="accordion-title">
              <Lock size={20} />
              <span>STAKE DXN</span>
              <span className="accordion-badge">{currentBonus}x BONUS</span>
            </div>
            {expandedCard === 'stake' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expandedCard === 'stake' && (
            <div className="accordion-content clickable" onClick={() => {
              const section = document.querySelector('.user-actions');
              if (section) section.scrollIntoView({ behavior: 'smooth' });
            }}>
              <p>Epochs 1-25: Early stakers earn bonus tickets! Starts at <strong>10x</strong> and decreases linearly to 1x.</p>
              <div className="accordion-stats">
                <div className="acc-stat">
                  <span className="label">Current Epoch</span>
                  <span className="value">{protocol.currentEpoch}</span>
                </div>
                <div className="acc-stat">
                  <span className="label">Current Bonus</span>
                  <span className="value highlight">{currentBonus}x</span>
                </div>
              </div>
              <p className="accordion-note"><Lock size={14} className="inline-icon" /> DXN locked until Epoch 26</p>
              <span className="accordion-link">Stake Now →</span>
            </div>
          )}
        </div>

        {/* Card 2: Long-Term Staking */}
        <div className={`accordion-card ${expandedCard === 'lts' ? 'expanded' : ''}`}>
          <button 
            className="accordion-header"
            onClick={() => toggleCard('lts')}
          >
            <div className="accordion-title">
              <Gem size={20} />
              <span>LONG-TERM STAKING</span>
              <span className="accordion-badge diamond">DIAMOND</span>
            </div>
            {expandedCard === 'lts' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expandedCard === 'lts' && (
            <div className="accordion-content clickable" onClick={() => { onNavigate('longterm'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <p>Starting <strong>Epoch 26</strong>: Lock DXN or GOLD for 1000-5000 days and earn from exclusive ETH pools.</p>
              <div className="lock-tiers">
                <span className="tier">1000d</span>
                <span className="tier">2000d</span>
                <span className="tier">3000d</span>
                <span className="tier">4000d</span>
                <span className="tier highlight">5000d</span>
              </div>
              <ul className="accordion-benefits">
                <li><CheckCircle size={14} className="inline-icon check" /> Exclusive ETH rewards</li>
                <li><CheckCircle size={14} className="inline-icon check" /> Higher tier = more weight</li>
                <li><CheckCircle size={14} className="inline-icon check" /> No dilution after lock</li>
              </ul>
              <p className="accordion-note"><Clock size={14} className="inline-icon" /> Opens Epoch 26, closes Epoch 51</p>
              <span className="accordion-link">View Details →</span>
            </div>
          )}
        </div>

        {/* Card 3: Burn XEN */}
        <div className={`accordion-card ${expandedCard === 'burn' ? 'expanded' : ''}`}>
          <button 
            className="accordion-header"
            onClick={() => toggleCard('burn')}
          >
            <div className="accordion-title">
              <Flame size={20} />
              <span>BURN XEN</span>
              <span className="accordion-badge fire">TICKETS</span>
            </div>
            {expandedCard === 'burn' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expandedCard === 'burn' && (
            <div className="accordion-content clickable" onClick={() => { onNavigate('burn'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <p>Burn XEN in batches of <strong>2.5M</strong> to earn tickets for GOLD distribution.</p>
              <div className="accordion-stats">
                <div className="acc-stat">
                  <span className="label">Batch Size</span>
                  <span className="value">2.5M XEN</span>
                </div>
                <div className="acc-stat">
                  <span className="label">Max Ticket</span>
                  <span className="value">10K batches</span>
                </div>
              </div>
              <p className="accordion-note"><Lightbulb size={14} className="inline-icon bulb" /> Tickets earn GOLD from 8.88% buy & burn</p>
              <span className="accordion-link">Burn XEN →</span>
            </div>
          )}
        </div>

        {/* Card 4: How It Works */}
        <div className={`accordion-card ${expandedCard === 'howitworks' ? 'expanded' : ''}`}>
          <button
            className="accordion-header"
            onClick={() => toggleCard('howitworks')}
          >
            <div className="accordion-title">
              <BookOpen size={20} />
              <span>HOW IT WORKS</span>
              <span className="accordion-badge docs">DOCS</span>
            </div>
            {expandedCard === 'howitworks' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {expandedCard === 'howitworks' && (
            <div className="accordion-content clickable" onClick={() => { onNavigate('howitworks'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <p>Learn about the <strong>DXN Forge</strong> protocol, tokenomics, and how to maximize your rewards.</p>
              <ul className="accordion-benefits">
                <li><BookOpen size={14} className="inline-icon" /> Protocol overview</li>
                <li><BarChart3 size={14} className="inline-icon" /> Tokenomics breakdown</li>
                <li><Target size={14} className="inline-icon" /> Strategy guides</li>
              </ul>
              <span className="accordion-link">Read Docs →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hero;