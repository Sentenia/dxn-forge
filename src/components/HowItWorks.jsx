import React from 'react';
import { Flame, Ticket, Users, Coins, Lock, Zap, TrendingUp, ArrowRight, Gift, Trophy, LockKeyhole } from 'lucide-react';
import NavAccordion from './NavAccordion';
import './HowItWorks.css';

function HowItWorks({ onNavigate }) {
  return (
    <div className="how-it-works-page">
      {/* Hero Section with Logo */}
      <div className="hiw-hero">
        <div className="logo-container">
          <div className="logo-glow" />
          <img
            src="/dbxen-gold.png"
            alt="DBXen DXN GOLD"
            className="hiw-logo"
          />
        </div>
        <h1 className="hiw-tagline">The DXN Forge Ecosystem</h1>
        <p className="hiw-subtitle">A self-sustaining protocol for DXN value accrual</p>
      </div>

      {/* Navigation */}
      <NavAccordion currentPage="howitworks" onNavigate={onNavigate} />

      {/* Animated Flow Diagram */}
      <div className="flow-diagram-section">
        <h2 className="section-title">
          <Zap size={24} />
          Protocol Flow
        </h2>

        <div className="flow-diagram-container">
          <svg viewBox="0 0 650 620" className="flow-diagram">
            <defs>
              {/* Gradients */}
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9d00" />
                <stop offset="100%" stopColor="#ffb700" />
              </linearGradient>
              <linearGradient id="ethGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Arrow markers */}
              <marker id="arrowGold" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ff9d00" />
              </marker>
              <marker id="arrowPurple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
              </marker>
              <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
              <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
              </marker>
              <marker id="arrowYellow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ffd700" />
              </marker>
            </defs>

            {/* ============ ROW 1: PARTICIPANTS ============ */}

            {/* DXN Stakers */}
            <g className="node">
              <rect x="80" y="25" width="130" height="55" rx="12" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="2" />
              <text x="145" y="48" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="600">DXN STAKERS</text>
              <text x="145" y="66" textAnchor="middle" fill="#a855f7" fontSize="9">stake DXN tokens</text>
            </g>

            {/* XEN Burners */}
            <g className="node">
              <rect x="440" y="25" width="130" height="55" rx="12" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" />
              <text x="505" y="48" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="600">XEN BURNERS</text>
              <text x="505" y="66" textAnchor="middle" fill="#ef4444" fontSize="9">burn XEN batches</text>
            </g>

            {/* ============ ROW 2: THE FORGE ============ */}

            {/* Forge background glow */}
            <circle cx="325" cy="150" r="50" fill="rgba(255, 157, 0, 0.08)" className="pulse-circle" />

            {/* The Forge */}
            <g className="node" filter="url(#glow)">
              <circle cx="325" cy="150" r="42" fill="rgba(255, 157, 0, 0.2)" stroke="url(#goldGradient)" strokeWidth="3" />
              {/* Flame icon */}
              <path d="M325 125 c-8 12-14 20-14 28 c0 10 6 16 14 16 c8 0 14-6 14-16 c0-8-6-16-14-28 z m0 36 c-4 0-6-3-6-8 c0-4 3-8 6-14 c3 6 6 10 6 14 c0 5-2 8-6 8z" fill="#ff9d00" />
              <text x="325" y="170" textAnchor="middle" fill="#ffb700" fontSize="10" fontWeight="700">THE FORGE</text>
            </g>

            {/* Arrows: Participants → Forge */}
            <path d="M 165 80 L 280 130" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowPurple)">
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1s" repeatCount="indefinite" />
            </path>
            <path d="M 485 80 L 370 130" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowRed)">
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1s" repeatCount="indefinite" />
            </path>

            {/* ============ ROW 3: TICKETS ============ */}

            {/* Tickets */}
            <g className="node">
              <rect x="270" y="230" width="110" height="50" rx="10" fill="rgba(255, 157, 0, 0.15)" stroke="#ff9d00" strokeWidth="2" />
              {/* Ticket icon */}
              <rect x="312" y="240" width="26" height="16" rx="2" fill="none" stroke="#ff9d00" strokeWidth="1.5" />
              <line x1="320" y1="240" x2="320" y2="256" stroke="#ff9d00" strokeWidth="1" strokeDasharray="2,2" />
              <text x="325" y="270" textAnchor="middle" fill="#ffb700" fontSize="10" fontWeight="600">TICKETS</text>
            </g>

            {/* Arrow: Forge → Tickets */}
            <path d="M 325 192 L 325 228" fill="none" stroke="url(#goldGradient)" strokeWidth="3" markerEnd="url(#arrowGold)">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
            <text x="348" y="215" fill="#ff9d00" fontSize="8" fontWeight="600">OUTPUT 1</text>

            {/* Arrows: Tickets → back to Participants (split) */}
            <path d="M 270 245 Q 180 200 155 82" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrowPurple)">
              <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <text x="175" y="170" fill="#c084fc" fontSize="8" fontWeight="500">by weight</text>

            <path d="M 380 245 Q 470 200 495 82" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrowRed)">
              <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <text x="455" y="170" fill="#f87171" fontSize="8" fontWeight="500">by weight</text>

            {/* ============ ROW 4: GOLD (Buy & Burn converts tickets) ============ */}

            {/* GOLD Token */}
            <g className="node">
              <rect x="270" y="320" width="110" height="50" rx="10" fill="rgba(255, 215, 0, 0.15)" stroke="#ffd700" strokeWidth="2" />
              {/* Gold coin SVG instead of emoji for consistent color */}
              <circle cx="325" cy="338" r="9" fill="#ffd700" stroke="#ffb700" strokeWidth="1.5" />
              <text x="325" y="342" textAnchor="middle" fill="#8B6914" fontSize="10" fontWeight="700">G</text>
              <text x="325" y="360" textAnchor="middle" fill="#ffd700" fontSize="10" fontWeight="600">GOLD</text>
            </g>

            {/* Arrow: Tickets → GOLD */}
            <path d="M 325 280 L 325 318" fill="none" stroke="#ffd700" strokeWidth="3" markerEnd="url(#arrowYellow)">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
            <text x="348" y="302" fill="#ffd700" fontSize="8" fontWeight="600">OUTPUT 2</text>
            <text x="270" y="302" fill="#ffd700" fontSize="7">Buy&Burn</text>

            {/* ============ ROW 5: GOLD STAKERS ============ */}

            {/* GOLD Stakers */}
            <g className="node">
              <rect x="255" y="405" width="140" height="55" rx="12" fill="rgba(255, 215, 0, 0.1)" stroke="#ffd700" strokeWidth="2" />
              <text x="325" y="428" textAnchor="middle" fill="#ffd700" fontSize="11" fontWeight="600">GOLD STAKERS</text>
              {/* User icons */}
              <g transform="translate(295, 438)">
                <circle cx="8" cy="4" r="4" fill="#ffd700" />
                <path d="M0 16 Q0 10 8 10 Q16 10 16 16" fill="#ffd700" />
              </g>
              <g transform="translate(315, 438)">
                <circle cx="8" cy="4" r="4" fill="#ffd700" />
                <path d="M0 16 Q0 10 8 10 Q16 10 16 16" fill="#ffd700" />
              </g>
              <g transform="translate(335, 438)">
                <circle cx="8" cy="4" r="4" fill="#ffd700" />
                <path d="M0 16 Q0 10 8 10 Q16 10 16 16" fill="#ffd700" />
              </g>
            </g>

            {/* Arrow: GOLD → GOLD Stakers */}
            <path d="M 325 370 L 325 403" fill="none" stroke="#ffd700" strokeWidth="2" markerEnd="url(#arrowYellow)">
              <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.6s" repeatCount="indefinite" />
            </path>
            <text x="340" y="390" fill="#ffd700" fontSize="7">stake</text>

            {/* ============ ROW 6: ETH DISTRIBUTION ============ */}

            {/* ETH Rewards (88%) */}
            <g className="node">
              <rect x="255" y="495" width="140" height="45" rx="10" fill="rgba(96, 165, 250, 0.15)" stroke="#60a5fa" strokeWidth="2" />
              {/* Coins icon */}
              <circle cx="285" cy="512" r="6" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <text x="285" y="515" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="700">Ξ</text>
              <text x="330" y="515" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">ETH REWARDS</text>
              <text x="325" y="530" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">88% of fees</text>
            </g>

            {/* Arrow: GOLD Stakers → ETH */}
            <path d="M 325 460 L 325 493" fill="none" stroke="url(#ethGradient)" strokeWidth="3" markerEnd="url(#arrowBlue)">
              <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.6s" repeatCount="indefinite" />
            </path>
            <text x="348" y="480" fill="#60a5fa" fontSize="8" fontWeight="600">OUTPUT 3</text>

            {/* Buy & Burn bucket (8.88%) */}
            <g className="node">
              <rect x="80" y="495" width="100" height="45" rx="8" fill="rgba(255, 157, 0, 0.1)" stroke="#ff9d00" strokeWidth="1.5" />
              {/* Flame icon */}
              <path d="M95 507 c-3 5-5 8-5 11 c0 4 2.5 6 5 6 c2.5 0 5-2 5-6 c0-3-2-6-5-11z" fill="#ff9d00" />
              <text x="140" y="515" textAnchor="middle" fill="#ff9d00" fontSize="9" fontWeight="600">BUY & BURN</text>
              <text x="130" y="530" textAnchor="middle" fill="#ff9d00" fontSize="8">8.88%</text>
            </g>

            {/* LTS Crucible (3.12%) */}
            <g className="node">
              <rect x="470" y="495" width="100" height="45" rx="8" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" strokeWidth="1.5" />
              {/* Gem/Diamond icon */}
              <path d="M485 508 l5 -5 l5 5 l-5 10 z" fill="none" stroke="#c084fc" strokeWidth="1.5" />
              <text x="530" y="515" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="600">LTS CRUCIBLE</text>
              <text x="520" y="530" textAnchor="middle" fill="#a855f7" fontSize="8">3.12%</text>
            </g>

            {/* Fee distribution arrows */}
            <path d="M 255 517 L 182 517" fill="none" stroke="#ff9d00" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowGold)">
              <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
            </path>
            <path d="M 395 517 L 468 517" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrowPurple)">
              <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
            </path>

            {/* ============ LOOP BACK ARROWS ============ */}

            {/* ETH/GOLD back to DXN Stakers */}
            <path d="M 255 520 Q 40 450 40 52 Q 40 25 78 40" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowPurple)" opacity="0.7">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
            </path>
            <text x="20" y="280" fill="#c084fc" fontSize="8" fontWeight="500" transform="rotate(-90, 20, 280)">reinvest → stake DXN</text>

            {/* ETH/GOLD back to XEN Burners */}
            <path d="M 395 520 Q 610 450 610 52 Q 610 25 572 40" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowRed)" opacity="0.7">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
            </path>
            <text x="630" y="280" fill="#f87171" fontSize="8" fontWeight="500" transform="rotate(90, 630, 280)">reinvest → burn XEN</text>

            {/* ============ LABELS ============ */}
            <text x="325" y="580" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Protocol fee sources: XEN burn fees, DXN stake/unstake, GOLD transactions</text>
          </svg>
        </div>

        <p className="flow-description">
          <strong>The complete loop:</strong> DXN Stakers and XEN Burners earn tickets from the Forge.
          Tickets convert to GOLD when Buy & Burn executes. GOLD holders stake to earn 88% of protocol ETH fees.
          Participants reinvest their rewards to stake more DXN or burn more XEN, completing the cycle.
        </p>
      </div>

      {/* Explanation Cards */}
      <div className="explanation-section">
        <div className="explanation-grid">

          {/* DXN Staking */}
          <div className="explanation-card">
            <div className="card-header purple">
              <Lock size={24} />
              <h3>DXN Staking</h3>
            </div>
            <div className="card-content">
              <p>
                Stake your DXN tokens in the Forge to earn tickets every time protocol fees are claimed.
                Your ticket allocation is proportional to your staked weight relative to total staked DXN.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> Stake any amount of DXN</li>
                <li><ArrowRight size={14} /> Earn 1 ticket split among all stakers per claim</li>
                <li><ArrowRight size={14} /> Unstake anytime after 24-hour lock</li>
                <li><ArrowRight size={14} /> Pending DXN becomes staked next cycle</li>
              </ul>
            </div>
          </div>

          {/* XEN Burning */}
          <div className="explanation-card">
            <div className="card-header red">
              <Flame size={24} />
              <h3>XEN Burning</h3>
            </div>
            <div className="card-content">
              <p>
                Burn XEN in batches of 2.5 million to earn tickets. Each 10,000 batches equals 1 ticket.
                Burning in bulk gives you a protocol fee discount up to 50%.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> 2.5M XEN per batch</li>
                <li><ArrowRight size={14} /> 1 batch = 0.0001 tickets</li>
                <li><ArrowRight size={14} /> Volume discounts on fees</li>
                <li><ArrowRight size={14} /> All burned XEN is permanently removed</li>
              </ul>
            </div>
          </div>

          {/* Tickets & GOLD */}
          <div className="explanation-card">
            <div className="card-header gold">
              <Ticket size={24} />
              <h3>Tickets & GOLD Distribution</h3>
            </div>
            <div className="card-content">
              <p>
                Tickets determine your share of GOLD minted from the 8.88% Buy & Burn bucket.
                When someone executes Buy & Burn, DXN is purchased at market and burned to mint GOLD 1:1.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> Tickets accumulate each epoch</li>
                <li><ArrowRight size={14} /> Buy & Burn ends epoch and distributes GOLD</li>
                <li><ArrowRight size={14} /> GOLD is automatically staked for you</li>
                <li><ArrowRight size={14} /> Early epoch bonus multipliers (up to 10x)</li>
              </ul>
            </div>
          </div>

          {/* GOLD Staking */}
          <div className="explanation-card">
            <div className="card-header yellow">
              <Trophy size={24} />
              <h3>GOLD Staking for ETH</h3>
            </div>
            <div className="card-content">
              <p>
                Staked GOLD earns 88% of all protocol ETH fees. Your share is based on your
                GOLD stake relative to total staked GOLD. Claim ETH rewards anytime.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> 88% of fees go to GOLD stakers</li>
                <li><ArrowRight size={14} /> Proportional to your GOLD stake</li>
                <li><ArrowRight size={14} /> Auto-staked GOLD earns immediately</li>
                <li><ArrowRight size={14} /> Manually stake additional GOLD</li>
              </ul>
            </div>
          </div>

          {/* Long-Term Staking */}
          <div className="explanation-card">
            <div className="card-header purple">
              <LockKeyhole size={24} />
              <h3>Long-Term Staking Crucibles</h3>
            </div>
            <div className="card-content">
              <p>
                Lock DXN or GOLD in Crucibles for 1-10 years to earn from the 3.12% LTS pool.
                Longer locks earn higher APY multipliers. Claim ETH when your position matures.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> 3.12% of fees to LTS pool</li>
                <li><ArrowRight size={14} /> 1-10 year lock periods</li>
                <li><ArrowRight size={14} /> Higher years = higher multiplier</li>
                <li><ArrowRight size={14} /> Claim full ETH at maturity</li>
              </ul>
            </div>
          </div>

          {/* Buy & Burn */}
          <div className="explanation-card">
            <div className="card-header orange">
              <Zap size={24} />
              <h3>Buy & Burn Mechanism</h3>
            </div>
            <div className="card-content">
              <p>
                8.88% of claimed ETH goes to the Buy & Burn bucket. Anyone can trigger it to
                buy DXN at market price, burn it, and mint equivalent GOLD distributed to ticket holders.
              </p>
              <ul className="feature-list">
                <li><ArrowRight size={14} /> Creates constant DXN buy pressure</li>
                <li><ArrowRight size={14} /> Burns DXN permanently</li>
                <li><ArrowRight size={14} /> Mints GOLD 1:1 with burned DXN</li>
                <li><ArrowRight size={14} /> Ends current epoch on execution</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div id="hiw-bottom" className="hiw-cta">
        <h3>Ready to participate?</h3>
        <div className="cta-buttons">
          <button className="cta-btn primary" onClick={() => onNavigate('stake')}>
            <Coins size={18} />
            Start Staking
          </button>
          <button className="cta-btn secondary" onClick={() => onNavigate('burn')}>
            <Flame size={18} />
            Burn XEN
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
