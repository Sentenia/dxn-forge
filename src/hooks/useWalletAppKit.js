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

  const numericChainId = chainId ? Number(chainId) : null;

  const fetchBalance = useCallback(async (addr) => {
    try {
      if (!walletProvider || !addr) return;
      const provider = new ethers.BrowserProvider(walletProvider);
      const bal = await provider.getBalance(addr);
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(2));
    } catch (err) {}
  }, [walletProvider]);

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance(address);
    } else {
      setBalance('0.00');
    }
  }, [isConnected, address, fetchBalance]);

  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => fetchBalance(address), 15000);
    return () => clearInterval(interval);
  }, [isConnected, address, fetchBalance]);

  const connect = async () => {
    try {
      setError(null);
      await open();
    } catch (err) {
      console.error('Wallet connect error:', err);
      setError(err.message);
    }
  };

  const disconnect = () => {
    try {
      appkitDisconnect();
      setBalance('0.00');
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

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