import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, FAUCET_ABI, SEPOLIA_RPC } from '../contracts';

export const useFaucet = (token, walletAddress) => {
  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const chainTime = useRef(0); // Last known time from chain

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Ready!';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Support both key formats: tDXN or TestDXN
  const getFaucetAddress = () => {
    return CONTRACTS[`t${token}`] || CONTRACTS[`Test${token}`] || null;
  };

  // Extract clean error message from ethers errors
  const parseError = (err) => {
    if (err.reason) return err.reason;
    if (err.revert && err.revert.args && err.revert.args[0]) return err.revert.args[0];
    if (err.code === 'ACTION_REJECTED' || err.code === 4001) return 'Transaction rejected';
    if (err.shortMessage) return err.shortMessage;
    return 'Claim failed — please try again';
  };

  // Sync cooldown from chain — uses PUBLIC RPC, zero MetaMask calls
  const syncFromChain = async () => {
    try {
      if (!walletAddress) return;

      const contractAddress = getFaucetAddress();
      if (!contractAddress) return;

      const readProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
      const contract = new ethers.Contract(contractAddress, FAUCET_ABI, readProvider);
      const time = Number(await contract.timeUntilNextClaim(walletAddress));
      
      chainTime.current = time;
      setTimeUntilNext(time);
    } catch (err) {
      // Silent fail for routine checks
    }
  };

  // Claim — the ONLY function that uses MetaMask (for signing)
  const claim = async () => {
    try {
      setClaiming(true);
      setError(null);
      setSuccess(false);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const contractAddress = getFaucetAddress();
      if (!contractAddress) {
        throw new Error(`No faucet contract for ${token}`);
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, FAUCET_ABI, signer);

      const tx = await contract.claim();
      await tx.wait();

      setSuccess(true);
      setTimeUntilNext(86400); // Show 24h immediately
      chainTime.current = 86400;
      await syncFromChain(); // Then get exact time
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Claim error:', err);
      const cleanMessage = parseError(err);
      setError(cleanMessage);
      if (cleanMessage.includes('24 hours')) {
        await syncFromChain();
      }
      setTimeout(() => setError(null), 8000);
    } finally {
      setClaiming(false);
    }
  };

  // Sync from chain on mount and every 60 seconds
  useEffect(() => {
    syncFromChain();
    const syncInterval = setInterval(syncFromChain, 60000);
    return () => clearInterval(syncInterval);
  }, [token, walletAddress]);

  // Local countdown — ticks every second for smooth display
  useEffect(() => {
    if (timeUntilNext <= 0) return;

    const tick = setInterval(() => {
      setTimeUntilNext((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [chainTime.current]); // Reset countdown when chain syncs

  return {
    timeUntilNext,
    timeRemaining: formatTimeRemaining(timeUntilNext),
    canClaim: timeUntilNext <= 0,
    claiming,
    claim,
    error,
    success,
  };
};