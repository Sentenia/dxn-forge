import React, { useState } from 'react';
import { Lock, Gem, Flame, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useForgeData } from '../hooks/useForgeData';
import './NavAccordion.css';

function NavAccordion({ currentPage, onNavigate }) {
  const { protocol } = useForgeData();
  const [expandedCard, setExpandedCard] = useState(null);

  const getBonus = (epoch) => {
    if (epoch <= 25) {
      const multiplier = 10 - ((epoch - 1) * (9 / 24));
      return Math.max(1, Math.round(multiplier * 10) / 10);
    }
    return 1;
  };

  const currentBonus = getBonus(protocol.currentEpoch || 1);

  const handleCardClick = (cardKey, page) => {
    if (currentPage === page) {
      // Already on this page — toggle expand/collapse
      setExpandedCard(expandedCard === cardKey ? null : cardKey);
    } else {
      // Different page — navigate
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="nav-accordion">
      {/* Stake DXN */}
      <div
        className={`accordion-card clickable ${currentPage === 'stake' ? 'active' : ''} ${expandedCard === 'stake' ? 'expanded' : ''}`}
        onClick={() => handleCardClick('stake', 'stake')}
      >
        <div className="accordion-header">
          <div className="accordion-title">
            <Lock size={18} />
            <span>STAKE DXN</span>
            <span className="accordion-badge">{currentBonus}x BONUS</span>
          </div>
          {currentPage === 'stake' ? (
            expandedCard === 'stake' ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          ) : (
            <span className="nav-arrow">→</span>
          )}
        </div>
        
        {expandedCard === 'stake' && (
          <div className="accordion-content">
            <p>Epochs 1-25: Early stakers earn bonus tickets! Starts at 10x and decreases to 1x.</p>
            <div className="accordion-stats">
              <div className="acc-stat">
                <span className="label">Epoch</span>
                <span className="value">{protocol.currentEpoch || 1}</span>
              </div>
              <div className="acc-stat">
                <span className="label">Bonus</span>
                <span className="value highlight">{currentBonus}x</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Long-Term Staking */}
      <div
        className={`accordion-card clickable ${currentPage === 'longterm' ? 'active' : ''} ${expandedCard === 'lts' ? 'expanded' : ''}`}
        onClick={() => handleCardClick('lts', 'longterm')}
      >
        <div className="accordion-header">
          <div className="accordion-title">
            <Gem size={18} />
            <span>LONG-TERM STAKING</span>
            <span className="accordion-badge diamond">DIAMOND</span>
          </div>
          {currentPage === 'longterm' ? (
            expandedCard === 'lts' ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          ) : (
            <span className="nav-arrow">→</span>
          )}
        </div>
        
        {expandedCard === 'lts' && (
          <div className="accordion-content">
            <p>Lock DXN or GOLD for 1000-5000 days. Earn from exclusive ETH pools.</p>
            <div className="lock-tiers">
              <span className="tier">1000d</span>
              <span className="tier">2000d</span>
              <span className="tier">3000d</span>
              <span className="tier">4000d</span>
              <span className="tier highlight">5000d</span>
            </div>
            <p className="accordion-note">⏰ Opens Epoch 26, closes Epoch 51</p>
          </div>
        )}
      </div>

      {/* Burn XEN */}
      <div
        className={`accordion-card clickable ${currentPage === 'burn' ? 'active' : ''} ${expandedCard === 'burn' ? 'expanded' : ''}`}
        onClick={() => handleCardClick('burn', 'burn')}
      >
        <div className="accordion-header">
          <div className="accordion-title">
            <Flame size={18} />
            <span>BURN XEN</span>
            <span className="accordion-badge fire">TICKETS</span>
          </div>
          {currentPage === 'burn' ? (
            expandedCard === 'burn' ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          ) : (
            <span className="nav-arrow">→</span>
          )}
        </div>

        {expandedCard === 'burn' && (
          <div className="accordion-content">
            <p>Burn XEN in batches of 2.5M to earn tickets for GOLD distribution.</p>
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
          </div>
        )}
      </div>

      {/* How It Works */}
      <div
        className={`accordion-card clickable ${currentPage === 'howitworks' ? 'active' : ''} ${expandedCard === 'howitworks' ? 'expanded' : ''}`}
        onClick={() => handleCardClick('howitworks', 'howitworks')}
      >
        <div className="accordion-header">
          <div className="accordion-title">
            <BookOpen size={18} />
            <span>HOW IT WORKS</span>
            <span className="accordion-badge">GUIDE</span>
          </div>
          {currentPage === 'howitworks' ? (
            expandedCard === 'howitworks' ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          ) : (
            <span className="nav-arrow">→</span>
          )}
        </div>

        {expandedCard === 'howitworks' && (
          <div className="accordion-content">
            <p>Learn how the DXN Forge ecosystem works with detailed explanations and flow diagrams.</p>
            <ul className="accordion-benefits">
              <li>📊 Protocol flow diagram</li>
              <li>💡 Staking & burning explained</li>
              <li>🎫 Tickets & GOLD distribution</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavAccordion;