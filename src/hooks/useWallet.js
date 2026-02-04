import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  useDisconnect,
} from '@reown/appkit/react';

const SEPOLIA_CHAIN_ID = 11155111;

export const useWallet = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');
  const { disconnect: appkitDisconnect } = useDisconnect();

  const [balance, setBalance] = useState('0.00');
  const [error, setError] = useState(null);

  // Normalize chainId to a number (AppKit may return it as number or bigint)
  const numericChainId = chainId ? Number(chainId) : null;

  // Fetch ETH balance using the connected wallet's provider
  const fetchBalance = useCallback(async (addr) => {
    try {
      if (!walletProvider || !addr) return;
      const provider = new ethers.BrowserProvider(walletProvider);
      const bal = await provider.getBalance(addr);
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(2));
    } catch (err) {
      // Silently fail — balance display is not critical
    }
  }, [walletProvider]);

  // Update balance when connection or address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchBalance(address);
    } else {
      setBalance('0.00');
    }
  }, [isConnected, address, fetchBalance]);

  // Poll balance every 15s when connected
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => fetchBalance(address), 15000);
    return () => clearInterval(interval);
  }, [isConnected, address, fetchBalance]);

  // Connect — opens the AppKit wallet selection modal
  const connect = async () => {
    try {
      setError(null);
      await open();
    } catch (err) {
      console.error('Wallet connect error:', err);
      setError(err.message);
    }
  };

  // Disconnect — clears AppKit connection state
  const disconnect = () => {
    try {
      appkitDisconnect();
      setBalance('0.00');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Switch to Sepolia
  const switchToSepolia = async () => {
    try {
      const provider = walletProvider || window.ethereum;
      if (!provider) return;
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        const provider = walletProvider || window.ethereum;
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };

  // getSigner — uses AppKit provider, falls back to window.ethereum
  // Components can use this instead of creating their own BrowserProvider
  const getSigner = useCallback(async () => {
    const p = walletProvider || window.ethereum;
    if (!p) throw new Error('No wallet connected');
    const provider = new ethers.BrowserProvider(p);
    return provider.getSigner();
  }, [walletProvider]);

  const fmtAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return {
    address: address || null,
    connected: isConnected,
    chainId: numericChainId,
    balance,
    isOnSepolia: numericChainId === SEPOLIA_CHAIN_ID,
    error,
    connect,
    disconnect,
    switchToSepolia,
    getSigner,
    formatAddress: fmtAddr,
  };
};