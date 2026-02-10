import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchBalance = useCallback(async (addr) => {
    try {
      if (!window.ethereum || !addr) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(addr);
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(2));
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          fetchBalance(accounts[0]);
        }
      });
      window.ethereum.on('accountsChanged', accounts => {
        if (accounts.length === 0) { setAddress(null); setIsConnected(false); }
        else { setAddress(accounts[0]); setIsConnected(true); fetchBalance(accounts[0]); }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_chainId' }).then(id => setChainId(Number(id)));
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(accounts[0]);
    setIsConnected(true);
    fetchBalance(accounts[0]);
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setBalance('0.00');
  };

  const getSigner = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet');
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  }, []);

  const fmtAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return {
    address,
    connected: isConnected,
    chainId,
    balance,
    isOnSepolia: chainId === 11155111,
    error: null,
    connect,
    disconnect,
    switchToSepolia: async () => {},
    getSigner,
    formatAddress: fmtAddr,
  };
};