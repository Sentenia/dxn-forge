import React, { useState, useEffect } from 'react';
import { Copy, FileText, Github, Flame, Twitter, Send, ChevronLeft, ChevronRight, ChevronUp, Check } from 'lucide-react';
import './Footer.css';

function Footer({ connectedChain = 'Ethereum', currentPage, onNavigate }) {
  const [copyToast, setCopyToast] = useState(false);

  const contracts = {
    DXN: '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F',
    FORGE: '0x4EDdFE898bbD3B16Ed7b7fCA7F7f8490b1A22ACa',
    GOLD: '0x6106Bf468C15D999b7dE22e458A41E77a3FaDdDf',
  };

  useEffect(() => {
    if (copyToast) {
      const timer = setTimeout(() => setCopyToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyToast]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyToast(true);
  };

  const prevPage = () => {
    if (currentPage === 'longterm') return 'stake';
    if (currentPage === 'burn') return 'longterm';
    return null;
  };

  const nextPage = () => {
    if (currentPage === 'stake') return 'longterm';
    if (currentPage === 'longterm') return 'burn';
    return null;
  };

  const pageLabel = (page) => {
    if (page === 'stake') return 'Main Staking';
    if (page === 'longterm') return 'Long-Term Staking';
    if (page === 'burn') return 'XEN Burn';
    return '';
  };

  return (
    <footer className="app-footer">
      {/* How It Works Section */}
      <div className="how-it-works">
        <h2 className="footer-title">How DXN Forge Works</h2>
        <div className="works-grid">
          <div className="work-card">
            <div className="work-number">1</div>
            <h3 className="work-title">Stake DXN</h3>
            <p className="work-description">
              Stake your DXN tokens to earn tickets. Ticket holders earn GOLD proportional to ticket weight at the end of each epoch. Early DXN Staker Bonus Epochs 1-25 up to 10x tickets.
            </p>
          </div>

          <div className="work-card">
            <div className="work-number">2</div>
            <h3 className="work-title">Earn Tickets</h3>
            <p className="work-description">
              ETH fees claimable at end of each 24h cycle from DBXen protocol claims. Each claimFees call gives Staker Class 1 ticket to split proportionally based on DXN stake weight.
            </p>
          </div>

          <div className="work-card">
            <div className="work-number">3</div>
            <h3 className="work-title">Mint GOLD</h3>
            <p className="work-description">
              Receive GOLD tokens based on tickets earned. Stake GOLD to earn ETH fees.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="footer-content">
        {/* Contract Addresses */}
        <div className="footer-section">
          <h3 className="section-title">Contract Addresses</h3>
          <div className="contract-list">
            <div className="contract-item-inline">
              <span className="contract-label-inline">DXN:</span>
              <span className="contract-address-inline">{contracts.DXN.slice(0, 10)}...{contracts.DXN.slice(-6)}</span>
              <button
                className="copy-icon-inline"
                onClick={() => copyToClipboard(contracts.DXN)}
                title="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="contract-item-inline">
              <span className="contract-label-inline">DXN Forge:</span>
              <span className="contract-address-inline">{contracts.FORGE.slice(0, 10)}...{contracts.FORGE.slice(-6)}</span>
              <button
                className="copy-icon-inline"
                onClick={() => copyToClipboard(contracts.FORGE)}
                title="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="contract-item-inline">
              <span className="contract-label-inline">GOLD:</span>
              <span className="contract-address-inline">{contracts.GOLD.slice(0, 10)}...{contracts.GOLD.slice(-6)}</span>
              <button
                className="copy-icon-inline"
                onClick={() => copyToClipboard(contracts.GOLD)}
                title="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h3 className="section-title">Resources</h3>
          <div className="link-list">
            <a href="https://github.com/Sentenia/dxn-forge/blob/main/docs/DXN_Forge_Litepaper.md" className="footer-link" target="_blank" rel="noopener noreferrer">
              <FileText size={16} style={{ display: 'inline', marginRight: '6px' }} /> Litepaper
            </a>
            <a href="https://github.com/Sentenia/dxn-forge" className="footer-link" target="_blank" rel="noopener noreferrer">
              <Github size={16} style={{ display: 'inline', marginRight: '6px' }} /> GitHub
            </a>
            <a href="https://dbxen.app" className="footer-link" target="_blank" rel="noopener noreferrer">
              <Flame size={16} style={{ display: 'inline', marginRight: '6px' }} /> DBXen Protocol
            </a>
          </div>
        </div>

        {/* Community */}
        <div className="footer-section">
          <h3 className="section-title">Community</h3>
          <div className="social-links">
            <a href="https://x.com/DXNForge" className="social-btn" target="_blank" rel="noopener noreferrer" title="Twitter">
              <Twitter size={20} />
            </a>
            <a href="https://t.me/+t32_6gEixFg2ZTkx" className="social-btn" target="_blank" rel="noopener noreferrer" title="Telegram">
              <Send size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="footer-nav-arrows">
        {prevPage() && (
          <button
            className="footer-arrow-btn"
            onClick={() => onNavigate(prevPage())}
            title={pageLabel(prevPage())}
          >
            <ChevronLeft size={24} />
            <span className="arrow-label">{pageLabel(prevPage())}</span>
          </button>
        )}

        <button
          className="footer-arrow-btn up-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
        >
          <ChevronUp size={24} />
        </button>

        {nextPage() && (
          <button
            className="footer-arrow-btn"
            onClick={() => onNavigate(nextPage())}
            title={pageLabel(nextPage())}
          >
            <span className="arrow-label">{pageLabel(nextPage())}</span>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Disclaimer */}
      <div className="footer-bottom">
        <p className="disclaimer">
          Community-built interface for the DXN Forge protocol. Not affiliated with the original DBXen team.
        </p>
        <p className="disclaimer">
          DXN Forge is a decentralized, permissionless, immutable smart contract protocol deployed on the Ethereum blockchain with no admin keys, upgrade mechanisms, or ability to be modified, paused, or controlled by any individual, team, or entity after deployment. No person or group operates, manages, or controls the protocol. This interface is a community-provided tool for interacting with on-chain smart contracts and does not constitute a service, platform, or business.
        </p>
        <p className="disclaimer">
          No tokens associated with this protocol represent securities, equity, shares, investment contracts, or any expectation of profit derived from the efforts of others. All token functionality is determined solely by immutable smart contract code. Users interact with the protocol at their own discretion and risk. There are no promises, guarantees, or representations of financial return. Do not use this protocol with funds you cannot afford to lose.
        </p>
        <p className="disclaimer">
          Smart contracts are inherently experimental and carry significant risk including but not limited to: total loss of funds, smart contract bugs or vulnerabilities, blockchain network failures, oracle failures, third-party protocol dependencies, regulatory action, and unforeseen economic exploits. All interactions with smart contracts are irreversible. Users are solely responsible for conducting their own due diligence, understanding the code, and complying with all applicable laws and regulations in their jurisdiction.
        </p>
        <p className="disclaimer">
          This software is provided "as-is" without warranty of any kind, express or implied. There is no guarantee of profits.
        </p>
        <p className="disclaimer">
          DYOR. NFA. NYKNYK. DNEPFTWOO.
        </p>
        <div className="network-status">
          <span className="status-dot"></span>
          Connected to {connectedChain}
        </div>
      </div>

      {/* Copy Toast */}
      {copyToast && (
        <div className="copy-toast">
          <Check size={16} />
          <span>Address copied!</span>
        </div>
      )}
    </footer>
  );
}

export default Footer;