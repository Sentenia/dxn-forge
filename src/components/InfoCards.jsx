import React from 'react';
import { Flame, Calendar, Ticket, Gem, Zap, Trophy, Lock } from 'lucide-react';
import { useForgeData } from '../hooks/useForgeData';
import './InfoCards.css';

function InfoCards() {
  const { loading, protocol } = useForgeData();

  const fmt = (num, decimals = 4) => {
    const val = parseFloat(num);
    if (isNaN(val)) return '0';
    if (val === 0) return '0';
    if (val > 0 && val < 0.0001) return val.toFixed(8);
    if (val < 1) return val.toFixed(6);
    return val.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const getBonus = (epoch) => {
    if (epoch <= 25) {
      const multiplier = 10 - ((epoch - 1) * (9 / 24));
      return Math.max(1, Math.round(multiplier * 10) / 10);
    }
    return 1;
  };

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="stat-card skeleton">
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  const bonus = getBonus(protocol.currentEpoch);

  return (
    <div className="stats-grid">

      {/* Current Epoch */}
      <div className="stat-card accent-amber">
        <div className="stat-header">
          <Calendar size={16} />
          <span>Current Epoch</span>
        </div>
        <div className="stat-value">{protocol.currentEpoch}</div>
        <div className="stat-footer">
          <span className="stat-tag amber">
            <Zap size={12} />
            {bonus}x bonus
          </span>
          <span className="stat-sub">24h cycles</span>
        </div>
      </div>

      {/* DXN Burned / GOLD Minted */}
      <div className="stat-card accent-orange">
        <div className="stat-header">
          <Flame size={16} />
          <span>DXN Burned / GOLD Minted</span>
        </div>
        <div className="stat-value">{fmt(protocol.goldSupply)}</div>
        <div className="stat-footer">
          <span className="stat-sub">1:1 ratio</span>
        </div>
      </div>

      {/* Total Tickets */}
      <div className="stat-card accent-amber">
        <div className="stat-header">
          <Ticket size={16} />
          <span>Tickets This Epoch</span>
        </div>
        <div className="stat-value">{fmt(protocol.ticketsThisEpoch)}</div>
        <div className="stat-footer split">
          <span className="stat-mini">
            <Ticket size={11} />
            Staker {fmt(protocol.stakerTickets, 2)}
          </span>
          <span className="stat-divider" />
          <span className="stat-mini fire">
            <Flame size={11} />
            Burner {fmt(protocol.burnerTickets, 2)}
          </span>
        </div>
      </div>

      {/* ETH in Buy & Burn */}
      <div className="stat-card accent-red">
        <div className="stat-header">
          <Gem size={16} />
          <span>ETH in Buy & Burn</span>
        </div>
        <div className="stat-value eth">{fmt(protocol.pendingBuyBurnEth)} <small>ETH</small></div>
        <div className="stat-footer">
          <span className="stat-tag red">8.88%</span>
          <span className="stat-sub">Forge DXN → GOLD</span>
        </div>
      </div>

      {/* GOLD Stakers Pool */}
      <div className="stat-card accent-gold">
        <div className="stat-header">
          <Trophy size={16} />
          <span>GOLD Stakers Pool</span>
        </div>
        <div className="stat-value gold">{fmt(protocol.goldStakersPool)} <small>ETH</small></div>
        <div className="stat-footer">
          <span className="stat-tag gold">88%</span>
          <span className="stat-sub">Claimable by stakers</span>
        </div>
      </div>

      {/* Crucible LTS Pool */}
      <div className="stat-card accent-purple">
        <div className="stat-header">
          <Lock size={16} />
          <span>Crucible LTS Pool</span>
        </div>
        <div className="stat-value purple">{fmt(protocol.pendingLts)} <small>ETH</small></div>
        <div className="stat-footer">
          <span className="stat-tag purple">3.12%</span>
          <span className="stat-sub">LTS maturity claims</span>
        </div>
      </div>
    </div>
  );
}

export default InfoCards;
