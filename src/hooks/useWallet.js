import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = 11155111;

export const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [error, setError] = useState(null);

  // Fetch ETH balance — uses MetaMask but only when already connected
  const fetchBalance = useCallback(async (addr) => {
    try {
      if (!window.ethereum || !addr) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(addr);
      setBalance(parseFloat(ethers.formatEther(balanceWei)).toFixed(2));
    } catch (err) {
      // Silently fail — balance display is not critical
    }
  }, []);

  // On mount: check if already connected (NON-PROMPTING)
  // Small delay to let MetaMask's service worker wake up
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (!window.ethereum) return;
        // eth_accounts is non-prompting — just checks silently
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
          setAddress(accounts[0]);
          setConnected(true);
          setChainId(parseInt(chainHex, 16));
          fetchBalance(accounts[0]);
        }
      } catch (err) {
        // MetaMask service worker might be dead — that's fine, user can click Connect
        console.warn('MetaMask check skipped:', err.message);
      }
    }, 500); // 500ms delay lets MetaMask initialize

    return () => clearTimeout(timer);
  }, [fetchBalance]);

  // Listen for MetaMask account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setConnected(false);
        setChainId(null);
        setBalance('0.00');
      } else {
        setAddress(accounts[0]);
        setConnected(true);
        fetchBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainHex) => {
      setChainId(parseInt(chainHex, 16));
      if (address) fetchBalance(address);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [address, fetchBalance]);

  // Poll balance every 15s when connected
  useEffect(() => {
    if (!connected || !address) return;
    const interval = setInterval(() => fetchBalance(address), 15000);
    return () => clearInterval(interval);
  }, [connected, address, fetchBalance]);

  // Connect — the ONLY function that prompts MetaMask
  const connect = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError('Please install MetaMask');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) return;

      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      setAddress(accounts[0]);
      setConnected(true);
      setChainId(parseInt(chainHex, 16));
      await fetchBalance(accounts[0]);

      if (parseInt(chainHex, 16) !== SEPOLIA_CHAIN_ID) {
        try { await switchToSepolia(); } catch (e) { /* non-fatal */ }
      }
    } catch (err) {
      console.error('Wallet connect error:', err);
      setError(err.message);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
    setChainId(null);
    setBalance('0.00');
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  const fmtAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return {
    address,
    connected,
    chainId,
    balance,
    isOnSepolia: chainId === SEPOLIA_CHAIN_ID,
    error,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress: fmtAddr,
  };
};