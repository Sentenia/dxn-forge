import React, { useState, useEffect, useRef } from 'react';
import { Flame, Wallet, Check, ChevronDown, AlertCircle, Gem, Zap, ExternalLink, Copy, LogOut } from 'lucide-react';
import { useFaucet } from '../hooks/useFaucet';
import { useWallet } from '../hooks/useWallet';
import './Header.css';

function Header({ onNavigate, currentPage = 'stake' }) {
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const [showChainMenu, setShowChainMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showCoffeeToast, setShowCoffeeToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  const navMenuRef = useRef(null);
  const chainMenuRef = useRef(null);
  const walletMenuRef = useRef(null);
  
  // Real wallet connection with balance
  const { address, connected, connect, disconnect, formatAddress, balance, chainId, isOnSepolia, switchToSepolia } = useWallet();
  
  // Faucet hooks
  const dxnFaucet = useFaucet('DXN');
  const xenFaucet = useFaucet('XEN');
  
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

  // Auto-detect network when wallet connects
  useEffect(() => {
    if (connected && chainId) {
      const network = chains.find(c => c.chainId === chainId);
      if (network) {
        setSelectedChain(network.name);
      }
    }
  }, [connected, chainId]);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setShowNavMenu(false);
      }
      if (chainMenuRef.current && !chainMenuRef.current.contains(event.target)) {
        setShowChainMenu(false);
      }
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
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
          {/* Left: Hamburger Menu + Logo */}
          <div className="header-left">
            {/* Hamburger Menu */}
            <div className="nav-menu-wrapper" ref={navMenuRef}>
              <button 
                className="hamburger-btn"
                onClick={() => setShowNavMenu(!showNavMenu)}
              >
                ☰
              </button>
              
              {showNavMenu && (
                <div className="nav-dropdown">
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
              )}
            </div>

            {/* Logo */}
            <div className="header-logo" onClick={() => onNavigate('stake')} style={{cursor: 'pointer'}}>
              <div className="logo-wrapper">
                <div className="logo-circle">
                  <Flame className="logo-flame" size={28} />
                  <div className="flame-glow"></div>
                </div>
                <span className="logo-text">DXN Forge</span>
              </div>
            </div>
          </div>

          {/* Center: Testnet Faucet Buttons */}
          <div className="header-center">
            <div className="faucet-buttons">
              {/* ETH Faucet */}
              <button 
                className="faucet-btn"
                onClick={() => window.open('https://www.alchemy.com/faucets/ethereum-sepolia', '_blank')}
                title="Get Sepolia ETH"
              >
                <span className="faucet-icon">💧</span>
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">ETH</span>
                </div>
              </button>
              
              {/* DXN Faucet */}
              <button 
                className={`faucet-btn ${!dxnFaucet.canClaim || dxnFaucet.claiming ? 'disabled' : ''}`}
                onClick={dxnFaucet.claim}
                disabled={!dxnFaucet.canClaim || dxnFaucet.claiming}
                title={dxnFaucet.canClaim ? 'Claim 1000 Test DXN' : `Wait ${dxnFaucet.timeRemaining}`}
              >
                <span className="faucet-icon">💧</span>
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">
                    {dxnFaucet.claiming ? 'Claiming...' : 'DXN'}
                  </span>
                </div>
                {!dxnFaucet.canClaim && (
                  <span className="faucet-cooldown">{dxnFaucet.timeRemaining}</span>
                )}
              </button>
              
              {/* XEN Faucet */}
              <button 
                className={`faucet-btn ${!xenFaucet.canClaim || xenFaucet.claiming ? 'disabled' : ''}`}
                onClick={xenFaucet.claim}
                disabled={!xenFaucet.canClaim || xenFaucet.claiming}
                title={xenFaucet.canClaim ? 'Claim 1B Test XEN' : `Wait ${xenFaucet.timeRemaining}`}
              >
                <span className="faucet-icon">💧</span>
                <div className="faucet-label">
                  <span className="faucet-prefix">Test</span>
                  <span className="faucet-token">
                    {xenFaucet.claiming ? 'Claiming...' : 'XEN'}
                  </span>
                </div>
                {!xenFaucet.canClaim && (
                  <span className="faucet-cooldown">{xenFaucet.timeRemaining}</span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Chain Selector + Wallet + Coffee + Theme */}
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
                <ChevronDown size={16} className="chain-arrow" />
              </button>
              
              {showChainMenu && (
                <div className="chain-dropdown">
                  {chains.map(chain => (
                    <button
                      key={chain.name}
                      className={`chain-option ${selectedChain === chain.name ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedChain(chain.name);
                        setShowChainMenu(false);
                      }}
                    >
                      <span className="chain-icon">{chain.icon}</span>
                      <span>{chain.name}</span>
                      {selectedChain === chain.name && <Check size={16} className="check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Button with Dropdown */}
            <div className="wallet-wrapper" ref={walletMenuRef}>
              <button 
                className={`wallet-btn ${connected ? 'connected' : ''}`}
                onClick={handleWalletClick}
              >
                {connected ? (
                  <>
                    <div className="wallet-balance">
                      {balance} ETH
                    </div>
                    <Wallet size={18} className="wallet-icon" />
                    <span className="wallet-address">{formatAddress}</span>
                  </>
                ) : (
                  <>
                    <Wallet size={18} className="wallet-icon" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>

              {/* Wallet Dropdown Menu */}
              {connected && showWalletMenu && (
                <div className="wallet-dropdown">
                  <button 
                    className="wallet-menu-item"
                    onClick={handleCopyAddress}
                  >
                    <Copy size={16} />
                    <span>Copy Address</span>
                  </button>
                  <button 
                    className="wallet-menu-item"
                    onClick={handleViewOnExplorer}
                  >
                    <ExternalLink size={16} />
                    <span>View on Etherscan</span>
                  </button>
                  <button 
                    className="wallet-menu-item disconnect"
                    onClick={handleDisconnect}
                  >
                    <LogOut size={16} />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>

            {/* Coffee Tip Button */}
            <button 
              className="coffee-btn" 
              onClick={handleCoffeeClick}
            >
              <span className="coffee-emoji">☕</span>
              <div className="coffee-tooltip">Buy me a coffee!</div>
            </button>

            {/* Theme Toggle */}
            <button className="theme-btn" title="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Copy Address Toast */}
      {showCopyToast && (
        <div className="copy-toast">
          ✅ Address copied to clipboard!
        </div>
      )}

      {/* Coffee Toast */}
      {showCoffeeToast && (
        <div className="coffee-toast">
          ☕ Tip address copied! {TIP_ADDRESS}
        </div>
      )}

      {/* Network Warning */}
      {connected && !isOnSepolia && (
        <div className="network-warning-banner">
          <AlertCircle size={16} />
          <span>Wrong network! Please switch to Sepolia</span>
          <button 
            className="switch-network-btn"
            onClick={switchToSepolia}
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* Test Phase Banner */}
      <div className="test-banner">
        <AlertCircle size={16} />
        <span>TESTNET: Sepolia Network - Use test tokens only</span>
      </div>
      
      {/* Success/Error Messages */}
      {(dxnFaucet.success || xenFaucet.success) && (
        <div className="faucet-success-banner">
          ✅ Tokens claimed successfully!
        </div>
      )}
      {(dxnFaucet.error || xenFaucet.error) && (
        <div className="faucet-error-banner">
          ❌ {dxnFaucet.error || xenFaucet.error}
        </div>
      )}
    </>
  );
}

export default Header;