import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
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

  // Scroll state for scroll-to-top button
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Scroll to top
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  const pageShortLabels = {
    stake: 'Stake',
    longterm: 'LTS',
    burn: 'Burn',
    howitworks: 'Docs'
  };

  // Navigate to previous/next page
  const handlePrevPage = useCallback(() => {
    const idx = pages.indexOf(currentPage);
    if (idx > 0) {
      handleNavigation(pages[idx - 1]);
    }
  }, [currentPage, pages, handleNavigation]);

  const handleNextPage = useCallback(() => {
    const idx = pages.indexOf(currentPage);
    if (idx < pages.length - 1) {
      handleNavigation(pages[idx + 1]);
    }
  }, [currentPage, pages, handleNavigation]);

  // Render page content by page name
  const renderPageContent = (pageName) => {
    switch (pageName) {
      case 'stake':
        return (
          <div className="container">
            <Hero onNavigate={handleNavigation} />
            <InfoCards />
            <BigCards />
            <div id="user-actions-section">
              <UserActions />
            </div>
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

      {/* Page Indicator - fixed position with left/right navigation */}
      <div className="page-indicator">
        {/* Previous page button */}
        <button
          className={`indicator-chevron chevron-left ${currentIndex === 0 ? 'disabled' : ''}`}
          onClick={() => currentIndex > 0 && handlePrevPage()}
          disabled={currentIndex === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Page dots with label */}
        <div className="page-dots-wrapper">
          <div className="page-dots-container">
            {pages.map((page, index) => (
              <button
                key={page}
                className={`page-dot ${currentIndex === index ? 'active' : ''}`}
                onClick={() => handleNavigation(page)}
                aria-label={pageLabels[page]}
              />
            ))}
          </div>
          <span className="page-indicator-label">{pageShortLabels[currentPage]}</span>
        </div>

        {/* Next page button */}
        <button
          className={`indicator-chevron chevron-right ${currentIndex === pages.length - 1 ? 'disabled' : ''}`}
          onClick={() => currentIndex < pages.length - 1 && handleNextPage()}
          disabled={currentIndex === pages.length - 1}
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Separate scroll-to-top button (bottom right corner) */}
      <button
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={handleScrollTop}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>

      <Footer currentPage={currentPage} onNavigate={handleNavigation} />
    </div>
  );
}

export default App;