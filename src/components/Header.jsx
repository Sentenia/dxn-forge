import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Wallet, Check, ChevronDown, AlertCircle, Gem, Zap,
  ExternalLink, Copy, LogOut, Menu, Droplets, Coffee, Sun, Moon
} from 'lucide-react';
import { ethers } from 'ethers';
import { useFaucet } from '../hooks/useFaucet';
import { useWallet } from '../hooks/useWallet';
import { useForgeData } from '../hooks/useForgeData';
import { CONTRACTS } from '../contracts';
import './Header.css';

function Header({ onNavigate, currentPage = 'stake' }) {
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const [showChainMenu, setShowChainMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showCoffeeToast, setShowCoffeeToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const { protocol, user } = useForgeData();

  const tokenBalances = {
    dxn: parseFloat(user.dxnBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    xen: parseFloat(user.xenBalance || '0').toLocaleString(undefined, { maximumFractionDigits: 0 }),
    gold: parseFloat(user.goldBalance).toLocaleString(undefined, { maximumFractionDigits: 4 }),
  };

  const navMenuRef = useRef(null);
  const chainMenuRef = useRef(null);
  const walletMenuRef = useRef(null);

  const { address, connected, connect, disconnect, formatAddress, balance, chainId, isOnSepolia, switchToSepolia } = useWallet();

  const dxnFaucet = useFaucet('DXN', address);
  const xenFaucet = useFaucet('XEN', address);

  const TIP_ADDRESS = '0x8B15d4b385eeCeC23cA32C8Dc45a48876d5FcbF4';

  const chains = [
    { name: 'Sepolia', icon: '⟠', chainId: 11155111 },
    { name: 'Ethereum', icon: '⟠', chainId: 1 },
    { name: 'BNB Chain', icon: '🟡', chainId: 56 },
    { name: 'Base', icon: '🔵', chainId: 8453 },
    { name: 'Optimism', icon: '🔴', chainId: 10 },
    { name: 'PulseChain', icon: '💜', chainId: 369 },
    { name: 'Avalanche', icon: '🔺', chainId: 43114 },
  ];

  useEffect(() => {
    if (connected && chainId) {
      const network = chains.find(c => c.chainId === chainId);
      if (network) setSelectedChain(network.name);
    }
  }, [connected, chainId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) setShowNavMenu(false);
      if (chainMenuRef.current && !chainMenuRef.current.contains(event.target)) setShowChainMenu(false);
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) setShowWalletMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleWalletClick = () => {
    if (connected) {
      setShowWalletMenu(!showWalletMenu);
    } else {
      connect();
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const handleViewOnExplorer = () => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
  };

  const handleCoffeeClick = () => {
    navigator.clipboard.writeText(TIP_ADDRESS);
    setShowCoffeeToast(true);
    setTimeout(() => setShowCoffeeToast(false), 3000);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          {/* ── Left: Hamburger + Logo + Stats ── */}
          <div className="header-left">
            <div className="nav-menu-wrapper" ref={navMenuRef}>
              <button
                className="hamburger-btn"
                onClick={() => setShowNavMenu(!showNavMenu)}
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>

              {showNavMenu && (
                <div className="nav-dropdown">
                  {/* Navigation */}
                  <div className="nav-section">
                    <button
                      className={`nav-item ${currentPage === 'stake' ? 'active' : ''}`}
                      onClick={() => { onNavigate('stake'); setShowNavMenu(false); }}
                    >
                      <Flame size={18} /> Stake & Forge
                    </button>
                    <button
                      className={`nav-item ${currentPage === 'longterm' ? 'active' : ''}`}
                      onClick={() => { onNavigate('longterm'); setShowNavMenu(false); }}
                    >
                      <Gem size={18} /> Long-Term Staking
                    </button>
                    <button
                      className={`nav-item ${currentPage === 'burn' ? 'active' : ''}`}
                      onClick={() => { onNavigate('burn'); setShowNavMenu(false); }}
                    >
                      <Zap size={18} /> Burn XEN for Tickets
                    </button>
                  </div>

                  {/* Testnet Faucets — shown on tablet / mobile via CSS */}
                  <div className="nav-section nav-faucets">
                    <div className="nav-section-title">Testnet Faucets</div>
                    <button
                      className="nav-item"
                      onClick={() => { window.open('https://faucets.chain.link/sepolia', '_blank'); setShowNavMenu(false); }}
                    >
                      <Droplets size={18} />
                      <span>Get Test ETH</span>
                      <ExternalLink size={14} className="nav-item-end" />
                    </button>
                    <button
                      className={`nav-item ${(!dxnFaucet.canClaim || dxnFaucet.claiming) ? 'disabled' : ''}`}
                      onClick={() => { if (dxnFaucet.canClaim) { dxnFaucet.claim(); setShowNavMenu(false); } }}
                      disabled={!dxnFaucet.canClaim || dxnFaucet.claiming}
                    >
                      <Droplets size={18} />
                      <span>{dxnFaucet.claiming ? 'Claiming...' : 'Claim Test DXN'}</span>
                      {!dxnFaucet.canClaim && (
                        <span className="nav-cooldown">{dxnFaucet.timeRemaining}</span>
                      )}
                    </button>
                    <button
                      className={`nav-item ${(!xenFaucet.canClaim || xenFaucet.claiming) ? 'disabled' : ''}`}
                      onClick={() => { if (xenFaucet.canClaim) { xenFaucet.claim(); setShowNavMenu(false); } }}
                      disabled={!xenFaucet.canClaim || xenFaucet.claiming}
                    >
                      <Droplets size={18} />
                      <span>{xenFaucet.claiming ? 'Claiming...' : 'Claim Test XEN'}</span>
                      {!xenFaucet.canClaim && (
                        <span className="nav-cooldown">{xenFaucet.timeRemaining}</span>
                      )}
                    </button>
                  </div>

                  {/* Settings — shown on small mobile via CSS */}
                  <div className="nav-section nav-extras">
                    <div className="nav-section-title">Settings</div>
                    <button className="nav-item" onClick={() => { handleCoffeeClick(); setShowNavMenu(false); }}>
                      <Coffee size={18} />
                      <span>Tip the Dev</span>
                    </button>
                    <button className="nav-item" onClick={() => { toggleTheme(); setShowNavMenu(false); }}>
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="header-logo" onClick={() => onNavigate('stake')} style={{ cursor: 'pointer' }}>
              <div className="logo-wrapper">
                <div className="logo-circle">
                  <Flame className="logo-flame" size={28} />
                  <div className="flame-glow"></div>
                </div>
                <span className="logo-text">DXN Forge</span>
              </div>
            </div>

            <div className="header-stats-pills">
              <div className="stat-pill">
                <span className="stat-pill-label-full">Epoch</span>
                <span className="stat-pill-label-short">Ep</span>
                <span className="stat-pill-value">{protocol.currentEpoch || 1}</span>
                </div>
                <div className="stat-pill">
                <span className="stat-pill-label-full">Cycle</span>
                <span className="stat-pill-label-short">Cyc</span>
                <span className="stat-pill-value">{protocol.currentCycle || 1}</span>
                </div>
            </div>
          </div>

          {/* ── Center: Desktop Faucet Buttons ── */}
          <div className="header-center">
            <div className="faucet-buttons">
              <button
                className="faucet-btn"
                onClick={() => window.open('https://faucets.chain.link/sepolia', '_blank')}
                title="Get Sepolia ETH"
              >
                <Droplets size={16} className="faucet-icon" />
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">ETH</span>
                </div>
              </button>

              <button
                className={`faucet-btn ${!dxnFaucet.canClaim || dxnFaucet.claiming ? 'disabled' : ''}`}
                onClick={dxnFaucet.claim}
                disabled={!dxnFaucet.canClaim || dxnFaucet.claiming}
                title={dxnFaucet.canClaim ? 'Claim 1000 Test DXN' : `Wait ${dxnFaucet.timeRemaining}`}
              >
                <Droplets size={16} className="faucet-icon" />
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">{dxnFaucet.claiming ? '...' : 'DXN'}</span>
                </div>
                {!dxnFaucet.canClaim && (
                  <span className="faucet-cooldown">{dxnFaucet.timeRemaining}</span>
                )}
              </button>

              <button
                className={`faucet-btn ${!xenFaucet.canClaim || xenFaucet.claiming ? 'disabled' : ''}`}
                onClick={xenFaucet.claim}
                disabled={!xenFaucet.canClaim || xenFaucet.claiming}
                title={xenFaucet.canClaim ? 'Claim 1B Test XEN' : `Wait ${xenFaucet.timeRemaining}`}
              >
                <Droplets size={16} className="faucet-icon" />
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">{xenFaucet.claiming ? '...' : 'XEN'}</span>
                </div>
                {!xenFaucet.canClaim && (
                  <span className="faucet-cooldown">{xenFaucet.timeRemaining}</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Right: Chain + Wallet + Coffee + Theme ── */}
          <div className="header-actions">
            {/* Chain Selector */}
            <div className="chain-selector-wrapper" ref={chainMenuRef}>
              <button
                className="chain-selector-btn"
                onClick={() => setShowChainMenu(!showChainMenu)}
              >
                <span className="chain-icon">
                  {chains.find(c => c.name === selectedChain)?.icon}
                </span>
                <span className="chain-name">{selectedChain}</span>
                <ChevronDown size={14} className="chain-arrow" />
              </button>

              {showChainMenu && (
                <div className="chain-dropdown">
                  {chains.map(chain => (
                    <button
                      key={chain.name}
                      className={`chain-option ${selectedChain === chain.name ? 'active' : ''}`}
                      onClick={() => { setSelectedChain(chain.name); setShowChainMenu(false); }}
                    >
                      <span className="chain-icon">{chain.icon}</span>
                      <span>{chain.name}</span>
                      {selectedChain === chain.name && <Check size={16} className="check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet */}
            <div className="wallet-wrapper" ref={walletMenuRef}>
              <button
                className={`wallet-btn ${connected ? 'connected' : ''}`}
                onClick={handleWalletClick}
              >
                {connected ? (
                  <>
                    <span className="wallet-balance">{balance} ETH</span>
                    <div className="wallet-divider"></div>
                    <Wallet size={16} className="wallet-icon" />
                    <span className="wallet-address">{formatAddress}</span>
                  </>
                ) : (
                  <>
                    <Wallet size={18} className="wallet-icon" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>

              {connected && showWalletMenu && (
                <div className="wallet-dropdown">
                  <div className="wallet-balances">
                    <div className="wallet-balance-row">
                      <span className="balance-token" style={{ color: '#f59e0b' }}>GOLD</span>
                      <span className="balance-amount">{tokenBalances.gold}</span>
                    </div>
                    <div className="wallet-balance-row">
                      <span className="balance-token">DXN</span>
                      <span className="balance-amount">{tokenBalances.dxn}</span>
                    </div>
                    <div className="wallet-balance-row">
                      <span className="balance-token">XEN</span>
                      <span className="balance-amount">{tokenBalances.xen}</span>
                    </div>
                  </div>
                  <div className="wallet-menu-divider"></div>
                  <button className="wallet-menu-item" onClick={handleCopyAddress}>
                    <Copy size={16} /> <span>Copy Address</span>
                  </button>
                  <button className="wallet-menu-item" onClick={handleViewOnExplorer}>
                    <ExternalLink size={16} /> <span>View on Etherscan</span>
                  </button>
                  <button className="wallet-menu-item disconnect" onClick={handleDisconnect}>
                    <LogOut size={16} /> <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>

            {/* Coffee — hidden on mobile, available via hamburger */}
            <button className="coffee-btn" onClick={handleCoffeeClick}>
              <Coffee size={20} className="coffee-lucide" />
              <div className="coffee-tooltip">Keep the Dev caffeinated!</div>
            </button>

            {/* Theme — hidden on mobile, available via hamburger */}
            <button className="theme-btn" title="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Toasts ── */}
      {showCopyToast && (
        <div className="copy-toast">Address copied to clipboard!</div>
      )}
      {showCoffeeToast && (
        <div className="coffee-toast">
          <Coffee size={16} /> Tip address copied! {TIP_ADDRESS}
        </div>
      )}

      {/* ── Network Warning ── */}
      {connected && !isOnSepolia && (
        <div className="network-warning-banner">
          <AlertCircle size={16} />
          <span>Wrong network! Please switch to Sepolia</span>
          <button className="switch-network-btn" onClick={switchToSepolia}>
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* ── Testnet Banner ── */}
      <div className="test-banner">
        <AlertCircle size={16} />
        <span>TESTNET: Sepolia Network — Use test tokens only</span>
      </div>

      {/* ── Faucet Status ── */}
      {(dxnFaucet.success || xenFaucet.success) && (
        <div className="faucet-success-banner">Tokens claimed successfully!</div>
      )}
      {(dxnFaucet.error || xenFaucet.error) && (
        <div className="faucet-error-banner">{dxnFaucet.error || xenFaucet.error}</div>
      )}
    </>
  );
}

export default Header;