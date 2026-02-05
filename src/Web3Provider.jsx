import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { CONTRACTS, ERC20_ABI, FORGE_ABI, GOLD_ABI, MOCK_DBXEN_ABI } from './contracts';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contracts, setContracts] = useState({});

  useEffect(() => {
    if (window.ethereum) {
      const p = new BrowserProvider(window.ethereum);
      setProvider(p);

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) disconnect();
        else setAddress(accounts[0]);
      });

      window.ethereum.on('chainChanged', () => window.location.reload());

      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) connect();
      });
    }
  }, []);

  useEffect(() => {
    const target = signer || provider;
    if (target) {
      setContracts({
        forge: new Contract(CONTRACTS.DXNForge, FORGE_ABI, target),
        gold: new Contract(CONTRACTS.GOLDToken, GOLD_ABI, target),
        dxn: new Contract(CONTRACTS.tDXN, ERC20_ABI, target),
        dbxen: new Contract(CONTRACTS.MockDBXEN, MOCK_DBXEN_ABI, target),
      });
    }
  }, [signer, provider]);

  const connect = useCallback(async () => {
    if (!window.ethereum) return;
    const p = new BrowserProvider(window.ethereum);
    const accounts = await p.send('eth_requestAccounts', []);
    const network = await p.getNetwork();
    const s = await p.getSigner();
    setProvider(p);
    setSigner(s);
    setAddress(accounts[0]);
    setChainId(Number(network.chainId));
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, address, chainId, isConnected, contracts, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

export { formatEther, parseEther };