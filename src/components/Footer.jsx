import React from 'react';
import { Copy, ExternalLink, FileText, Github, Flame, Twitter, Send } from 'lucide-react';
import './Footer.css';

function Footer({ connectedChain = 'Ethereum' }) {
  // Mock contract addresses - replace with real ones after deployment
  const contracts = {
    DXN: '0x80f0C1c49891dcFDD40b6e0F960F84E6042bcB6F',
    FORGE: '0x...', // Your DXN Forge contract
    GOLD: '0x...', // Your GOLD token contract
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Address copied!');
  };

  const openEtherscan = (address) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
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
              Stake your DXN tokens to earn tickets.  Ticket holders earn GOLD proportional to ticket weight at the end of each epoch.  Early DXN Staker Bonus Epochs 1-25 up to 10x tickets.
            </p>
          </div>

          <div className="work-card">
            <div className="work-number">2</div>
            <h3 className="work-title">Earn Tickets</h3>
            <p className="work-description">
              ETH fees claimable at end of each 24h cycle from DBXen protocol claims.  Each claimFees call gives Staker Class 1 ticket to split proportionally based on DXN stake weight.
            </p>
          </div>

          <div className="work-card">
            <div className="work-number">3</div>
            <h3 className="work-title">Mint GOLD</h3>
            <p className="work-description">
              Receive GOLD tokens based on tickets earned.  Stake GOLD to earn ETH fees.
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
            <a href="https://github.com/Sentenia/dxn-forge-cl/blob/main/docs/DXN_Forge_Litepaper.md" className="footer-link" target="_blank" rel="noopener noreferrer">
              <FileText size={16} style={{display: 'inline', marginRight: '6px'}} /> Litepaper
            </a>
            <a href="https://github.com/Sentenia/dxn-forge-cl" className="footer-link" target="_blank" rel="noopener noreferrer">
              <Github size={16} style={{display: 'inline', marginRight: '6px'}} /> GitHub
            </a>
            <a href="https://dbxen.app" className="footer-link" target="_blank" rel="noopener noreferrer">
              <Flame size={16} style={{display: 'inline', marginRight: '6px'}} /> DBXen Protocol
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

      {/* Bottom Disclaimer */}
      <div className="footer-bottom">
        <p className="disclaimer">
          Community-built interface for the DXN Forge protocol. Not affiliated with the original DBXen team.
        </p>
        <p className="disclaimer">
          This interface is provided as-is. Use at your own risk. Always verify transactions before signing. Smart contract interactions are irreversible.
        </p>
        <div className="network-status">
          <span className="status-dot"></span>
          Connected to {connectedChain}
        </div>
      </div>
    </footer>
  );
}

export default Footer;