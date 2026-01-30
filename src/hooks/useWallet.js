import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [address, setAddress] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);

  // Sepolia chain ID (decimal: 11155111, hex: 0xaa36a7)
  const SEPOLIA_CHAIN_ID = 11155111;

  // Check if already connected on mount (but don't prompt)
  useEffect(() => {
    checkIfConnected();
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        setConnected(true);
        fetchBalance(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Poll balance every 10 seconds if connected
  useEffect(() => {
    if (!connected || !address) return;

    fetchBalance(address);
    const interval = setInterval(() => {
      fetchBalance(address);
    }, 10000);

    return () => clearInterval(interval);
  }, [connected, address]);

  const fetchBalance = async (addr) => {
    try {
      if (!window.ethereum || !addr) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(addr);
      const balanceEth = ethers.formatEther(balanceWei);
      
      // Format to 2 decimal places
      setBalance(parseFloat(balanceEth).toFixed(2));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const checkIfConnected = async () => {
    try {
      if (!window.ethereum) return;

      // Check without prompting
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        setAddress(accounts[0]);
        setConnected(true);
        setChainId(Number(network.chainId));
        await fetchBalance(accounts[0]);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const connect = async () => {
    try {
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      setAddress(accounts[0]);
      setConnected(true);
      setChainId(Number(network.chainId));
      await fetchBalance(accounts[0]);

      // If not on Sepolia, prompt to switch
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
    setChainId(null);
    setBalance('0');
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Hex format
      });
    } catch (switchError) {
      // If Sepolia not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network');
        }
      } else {
        throw switchError;
      }
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  return {
    address,
    connected,
    chainId,
    balance,
    isOnSepolia,
    error,
    connect,
    disconnect,
    switchToSepolia,
    formatAddress: formatAddress(address)
  };
};