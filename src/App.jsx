import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoCards from './components/InfoCards';
import BigCards from './components/BigCards';
import UserActions from './components/UserActions';
import LongTermStaking from './components/LongTermStaking';
import BurnXEN from './components/BurnXEN';
import Footer from './components/Footer';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import './styles/Dashboard.css';

function App() {
  const [currentPage, setCurrentPage] = useState('stake');
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      
      prov.listAccounts().then(accounts => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Swipe navigation for mobile/tablet
  const {
    pages,
    currentIndex,
    isEnabled: swipeEnabled,
    isDragging,
    containerRef,
    getContainerStyle,
  } = useSwipeNavigation(currentPage, handleNavigation);

  const pageLabels = {
    stake: 'Stake & Forge',
    longterm: 'Long-Term Staking',
    burn: 'Burn XEN'
  };

  return (
    <div className="app-wrapper">
      <Header onNavigate={handleNavigation} currentPage={currentPage} />

      {/* Mobile/Tablet: Swipeable pages rendered side by side */}
      {swipeEnabled ? (
        <div className="swipe-viewport">
          <div
            ref={containerRef}
            className={`swipe-container ${isDragging ? 'dragging' : ''}`}
            style={getContainerStyle()}
          >
            {/* Page 1: Dashboard */}
            <div className="swipe-page">
              <div className="container">
                <Hero onNavigate={handleNavigation} />
                <InfoCards />
                <BigCards />
                <UserActions />
              </div>
            </div>

            {/* Page 2: Long-Term Staking */}
            <div className="swipe-page">
              <LongTermStaking
                onNavigate={handleNavigation}
                provider={provider}
                account={account}
              />
            </div>

            {/* Page 3: Burn XEN */}
            <div className="swipe-page">
              <BurnXEN onNavigate={handleNavigation} />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: Conditional rendering (no swipe) */
        <div className="page-content">
          {currentPage === 'stake' && (
            <div className="container">
              <Hero onNavigate={handleNavigation} />
              <InfoCards />
              <BigCards />
              <UserActions />
            </div>
          )}

          {currentPage === 'longterm' && (
            <LongTermStaking
              onNavigate={handleNavigation}
              provider={provider}
              account={account}
            />
          )}

          {currentPage === 'burn' && (
            <BurnXEN onNavigate={handleNavigation} />
          )}
        </div>
      )}

      {/* Page Indicator Dots - only visible on mobile/tablet */}
      {swipeEnabled && (
        <div className="page-indicator">
          {pages.map((page, index) => (
            <button
              key={page}
              className={`page-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => handleNavigation(page)}
              aria-label={pageLabels[page]}
            />
          ))}
          <span className="page-indicator-label">{pageLabels[currentPage]}</span>
        </div>
      )}

      <Footer currentPage={currentPage} onNavigate={handleNavigation} />
    </div>
  );
}

export default App;