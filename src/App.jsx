import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoCards from './components/InfoCards';
import BigCards from './components/BigCards';
import UserActions from './components/UserActions';
import LongTermStaking from './components/LongTermStaking';
import BurnXEN from './components/BurnXEN';
import HowItWorks from './components/HowItWorks';
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
    incomingPage,
    containerRef,
    currentPageRef,
    incomingPageRef,
  } = useSwipeNavigation(currentPage, handleNavigation);

  const pageLabels = {
    stake: 'Stake & Forge',
    longterm: 'Long-Term Staking',
    burn: 'Burn XEN',
    howitworks: 'How It Works'
  };

  // Render page content by page name
  const renderPageContent = (pageName) => {
    switch (pageName) {
      case 'stake':
        return (
          <div className="container">
            <Hero onNavigate={handleNavigation} />
            <InfoCards />
            <BigCards />
            <UserActions />
          </div>
        );
      case 'longterm':
        return (
          <LongTermStaking
            onNavigate={handleNavigation}
            provider={provider}
            account={account}
          />
        );
      case 'burn':
        return <BurnXEN onNavigate={handleNavigation} />;
      case 'howitworks':
        return <HowItWorks onNavigate={handleNavigation} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-wrapper">
      <Header onNavigate={handleNavigation} currentPage={currentPage} />

      <div ref={containerRef} className="page-viewport">
        {/* Current page */}
        <div
          ref={currentPageRef}
          className={`page-content page-${currentPage}`}
        >
          {renderPageContent(currentPage)}
        </div>

        {/* Incoming page (only rendered during drag) */}
        {incomingPage && (
          <div
            ref={incomingPageRef}
            className={`page-content page-incoming page-${incomingPage}`}
          >
            {renderPageContent(incomingPage)}
          </div>
        )}
      </div>

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