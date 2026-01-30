import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SEPOLIA_CONTRACTS, FAUCET_ABI } from '../contracts.js';

export const useFaucet = (token) => {
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formatTimeRemaining = (seconds) => {
    if (seconds === 0) return 'Ready!';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const checkTimeRemaining = async () => {
    try {
      if (!window.ethereum) return;
      
      // Check if wallet is connected BEFORE requesting access
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) return; // Don't prompt connection
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const contractAddress = SEPOLIA_CONTRACTS[`Test${token}`];
      if (!contractAddress) return;
      
      const contract = new ethers.Contract(contractAddress, FAUCET_ABI, provider);
      const time = await contract.timeUntilNextClaim(address);
      
      setTimeUntilNext(Number(time));
    } catch (err) {
      console.error('Error checking time:', err);
    }
  };

  const claim = async () => {
    try {
      setClaiming(true);
      setError(null);
      setSuccess(false);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = SEPOLIA_CONTRACTS[`Test${token}`];
      const contract = new ethers.Contract(contractAddress, FAUCET_ABI, signer);
      
      const tx = await contract.claim();
      await tx.wait();
      
      setSuccess(true);
      await checkTimeRemaining();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Claim failed');
      setTimeout(() => setError(null), 5000);
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    checkTimeRemaining();
    const interval = setInterval(checkTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [token]);

  return {
    timeUntilNext,
    timeRemaining: formatTimeRemaining(timeUntilNext),
    canClaim: timeUntilNext === 0,
    claiming,
    claim,
    error,
    success
  };
};