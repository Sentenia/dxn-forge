import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Ticket, Gem, Zap } from 'lucide-react';

function InfoCards() {
  const currentEpoch = 7; // Mock data
  const [bonus, setBonus] = useState('7x');

  useEffect(() => {
    // Calculate bonus multiplier
    if (currentEpoch <= 25) {
      const multiplier = 10 - ((currentEpoch - 1) * (9 / 24));
      setBonus(Math.max(1, Math.round(multiplier * 10) / 10) + 'x');
    }
  }, [currentEpoch]);

  return (
    <div className="info-cards">
      {/* Card 1: DXN Burned / GOLD Minted */}
      <div className="info-card">
        <div className="info-card-header">
          <Flame size={20} className="info-card-icon" />
          <span>DXN Burned / GOLD Minted</span>
        </div>
        <div className="info-card-value">524,823</div>
        <div className="info-card-label">1:1 Ratio</div>
      </div>

      {/* Card 2: Current Epoch */}
      <div className="info-card">
        <div className="info-card-header">
          <Calendar size={20} className="info-card-icon" />
          <span>Current Epoch</span>
        </div>
        <div className="info-card-value">{currentEpoch}</div>
        <div className="info-card-label">24h cycles</div>
        <div className="epoch-bonus"><Zap size={14} style={{display: 'inline', marginRight: '4px'}} /> Bonus: {bonus} Tickets</div>
      </div>

      {/* Card 3: Total Tickets */}
      <div className="info-card">
        <div className="info-card-header">
          <Ticket size={20} className="info-card-icon" />
          <span>Total Tickets</span>
        </div>
        <div className="info-card-value">8,250</div>
        <div className="info-card-label">This cycle</div>
      </div>

      {/* Card 4: ETH in Buy & Burn */}
      <div className="info-card">
        <div className="info-card-header">
          <Gem size={20} className="info-card-icon" />
          <span>ETH in Buy & Burn</span>
        </div>
        <div className="info-card-value">2.4567</div>
        <div className="info-card-label">Ready to forge</div>
      </div>
    </div>
  );
}

export default InfoCards;