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

  return (
    <div className="app-wrapper">
      <Header onNavigate={handleNavigation} currentPage={currentPage} />
      
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

      <Footer currentPage={currentPage} onNavigate={handleNavigation} />
    </div>
  );
}

export default App;