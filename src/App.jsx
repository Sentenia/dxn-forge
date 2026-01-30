import React, { useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState('stake'); // 'stake', 'longterm', 'burn'

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
        <LongTermStaking />
      )}

      {currentPage === 'burn' && (
        <BurnXEN />
      )}

      <Footer />
    </div>
  );
}

export default App;