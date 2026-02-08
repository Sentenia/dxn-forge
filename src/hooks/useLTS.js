import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, FORGE_ABI, ERC20_ABI, DEPLOY_BLOCK } from '../contracts';

// Tier configuration
const TIERS = [
  { days: 1000, label: '1000d', weight: 1 },
  { days: 2000, label: '2000d', weight: 2 },
  { days: 3000, label: '3000d', weight: 3 },
  { days: 4000, label: '4000d', weight: 4 },
  { days: 5000, label: '5000d', weight: 5 },
];

export function useLTS(provider, account) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);
  
  // Crucible state
  const [currentCrucible, setCurrentCrucible] = useState(1);
  const [crucibleInfo, setCrucibleInfo] = useState({
    start: 0,
    end: 0,
    lock: 0,
  });
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowClosed, setWindowClosed] = useState(false);
  const [canStartNewCrucible, setCanStartNewCrucible] = useState(false);
  
  // Cycle/Epoch state
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  
  // Protocol totals
  const [totalDXNByTier, setTotalDXNByTier] = useState([0, 0, 0, 0, 0]);
  const [totalGOLDByTier, setTotalGOLDByTier] = useState([0, 0, 0, 0, 0]);
  const [ltsEthBucket, setLtsEthBucket] = useState('0');
  const [ltsBuckets, setLtsBuckets] = useState(['0', '0', '0', '0', '0']);
  
  // Tier snapshots
  const [tierSnapshots, setTierSnapshots] = useState([
    { taken: false, isMature: false },
    { taken: false, isMature: false },
    { taken: false, isMature: false },
    { taken: false, isMature: false },
    { taken: false, isMature: false },
  ]);
  
  // User state
  const [userPendingDXN, setUserPendingDXN] = useState([0, 0, 0, 0, 0]);
  const [userPendingGOLD, setUserPendingGOLD] = useState([0, 0, 0, 0, 0]);
  const [userHasMinted, setUserHasMinted] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  const [userStakedDXN, setUserStakedDXN] = useState('0');
  const [userStakedGOLD, setUserStakedGOLD] = useState('0');

  // Fetch all data
  const refreshData = useCallback(async () => {
    if (!provider) {
      setLoading(false);
      return;
    }

    try {
      // Only show loading spinner on initial load, not refetches
      if (!initialLoadDone.current) {
        setLoading(true);
      }
      setError(null);
      
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, provider);
      
      // Get current crucible and cycle
      const [crucibleId, cycle, epoch] = await Promise.all([
        forge.crucible(),
        forge.cycle(),
        forge.epoch(),
      ]);
      
      setCurrentCrucible(Number(crucibleId));
      setCurrentCycle(Number(cycle));
      setCurrentEpoch(Number(epoch));
      
      // Get crucible info
      const cru = await forge.crucibles(crucibleId);
      setCrucibleInfo({
        start: Number(cru.start),
        end: Number(cru.end),
        lock: Number(cru.lock),
      });
      
      // Check window status
      const isOpen = await forge.windowOpen(crucibleId);
      setIsWindowOpen(isOpen);
      setWindowClosed(Number(cycle) > Number(cru.end));
      
      // Can start new crucible?
      const canStart = await forge.canStartNew();
      setCanStartNewCrucible(canStart);
      
      // Get totals for current crucible
      const totals = await forge.getTotals(crucibleId);
      setTotalDXNByTier(totals.dxn.map(v => parseFloat(ethers.formatEther(v))));
      setTotalGOLDByTier(totals.gold.map(v => parseFloat(ethers.formatEther(v))));
      
      // Get LTS ETH bucket (total)
      const ltsEth = await forge.pendingLts();
      setLtsEthBucket(ethers.formatEther(ltsEth));

      // Get LTS buckets per tier
      const buckets = await forge.getLtsBuckets();
      setLtsBuckets([
        ethers.formatEther(buckets[0]),  // Tier 1 bucket (1000 days, 6.67% weight)
        ethers.formatEther(buckets[1]),  // Tier 2 bucket (2000 days, 13.33% weight)
        ethers.formatEther(buckets[2]),  // Tier 3 bucket (3000 days, 20.00% weight)
        ethers.formatEther(buckets[3]),  // Tier 4 bucket (4000 days, 26.67% weight)
        ethers.formatEther(buckets[4]),  // Tier 5 bucket (5000 days, 33.33% weight)
      ]);
      
      // Get tier snapshots
      const snapPromises = [];
      for (let i = 0; i < 5; i++) {
        snapPromises.push(forge.snaps(crucibleId, i));
        snapPromises.push(forge.isMature(crucibleId, i));
      }
      const snapResults = await Promise.all(snapPromises);
      
      const snaps = [];
      for (let i = 0; i < 5; i++) {
        const snap = snapResults[i * 2];
        const isMature = snapResults[i * 2 + 1];
        snaps.push({
          taken: snap.taken,
          isMature: isMature,
          dxnAlloc: ethers.formatEther(snap.dxnAlloc),
          goldAlloc: ethers.formatEther(snap.goldAlloc),
        });
      }
      setTierSnapshots(snaps);
      
      // Fetch user-specific data
      if (account) {
        await fetchUserData(forge, crucibleId, account, cycle);
      }
      
    } catch (err) {
      console.error('Error fetching LTS data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [provider, account]);

  // Fetch user-specific data
  const fetchUserData = async (forge, crucibleId, userAccount, currentCy) => {
    try {
      // Get user's WALLET balances (not staked - Crucible takes from wallet)
      const dxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, provider);
      const gold = new ethers.Contract(CONTRACTS.GOLDToken, ERC20_ABI, provider);
      
      const [dxnBalance, goldBalance] = await Promise.all([
        dxn.balanceOf(userAccount),
        gold.balanceOf(userAccount),
      ]);
      
      setUserStakedDXN(ethers.formatEther(dxnBalance));
      setUserStakedGOLD(ethers.formatEther(goldBalance));
      
      // Get user's pending positions for current crucible
      const pending = await forge.getPending(userAccount, crucibleId);
      setUserPendingDXN(pending.dxn.map(v => parseFloat(ethers.formatEther(v))));
      setUserPendingGOLD(pending.gold.map(v => parseFloat(ethers.formatEther(v))));
      setUserHasMinted(pending.minted);
      
      // Fetch user's NFTs via events
      await fetchUserNFTs(forge, userAccount, currentCy);
      
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Fetch NFTs via events (since we removed ERC721Enumerable)
  const fetchUserNFTs = async (forge, userAccount, currentCy) => {
    const addr = String(userAccount).toLowerCase();  // ← add this
    try {
      // Get mint events for this user
      const mintFilter = forge.filters.CruMint(userAccount);
      const mintEvents = await forge.queryFilter(mintFilter, DEPLOY_BLOCK, 'latest');
      
      // Get transfers TO and FROM user
      const transferToFilter = forge.filters.Transfer(null, userAccount);
      const transferFromFilter = forge.filters.Transfer(userAccount, null);
      const [transfersTo, transfersFrom] = await Promise.all([
        forge.queryFilter(transferToFilter, DEPLOY_BLOCK, 'latest'),
        forge.queryFilter(transferFromFilter, DEPLOY_BLOCK, 'latest'),
      ]);
      
      // Build ownership set
      const owned = new Set();
      mintEvents.forEach(e => owned.add(e.args.tokenId.toString()));
      transfersTo.forEach(e => owned.add(e.args.tokenId.toString()));
      transfersFrom.forEach(e => owned.delete(e.args.tokenId.toString()));

      console.log('NFT DEBUG:', { mintEvents: mintEvents.length, transfersTo: transfersTo.length, transfersFrom: transfersFrom.length, owned: [...owned] });
      
      // Fetch position data for each NFT
      const nftData = await Promise.all(
        [...owned].map(async (tokenId) => {
            try {
                
                const p = await forge.pos(tokenId);
                console.log('NFT', tokenId, 'pos:', { cru: p.cru, asset: p.asset, tier: Number(p.tier), amt: p.amt, claimed: p.claimed });
                if (p.claimed) return null;
                
                const mature = await forge.nftMature(tokenId);
                const eth = await forge.ethShare(tokenId);
                console.log('NFT', tokenId, 'mature:', mature, 'eth:', eth);
                
                // ... rest
            
            const unlockCycle = Number(p.lock) + TIERS[p.tier].days;
            const daysRemaining = mature ? 0 : unlockCycle - Number(currentCy);
            
            return {
              tokenId: tokenId,
              crucible: Number(p.cru),
              asset: p.asset,
              assetSymbol: p.asset.toLowerCase() === CONTRACTS.DXN.toLowerCase() ? 'DXN' : 'GOLD',
              tier: p.tier,
              tierLabel: TIERS[p.tier].label,
              amount: ethers.formatEther(p.amt),
              lockCycle: Number(p.lock),
              unlockCycle: unlockCycle,
              daysRemaining: Math.max(0, daysRemaining),
              isMature: mature,
              claimableEth: ethers.formatEther(eth),
              maturityDate: `Day ${unlockCycle}`,
            };
          } catch (err) {
            console.error('NFT fetch failed for', tokenId, err);
            return null;
            }
        })
      );
      
      const validNfts = nftData
        .filter(n => n !== null)
        .sort((a, b) => {
          if (a.crucible !== b.crucible) return Number(a.crucible) - Number(b.crucible);
          return Number(a.tier) - Number(b.tier);
        });
      
      setUserNFTs(validNfts);
      
    } catch (err) {
      console.error('Error fetching NFTs:', err);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // === WRITE FUNCTIONS ===

  const addDXNToLTS = async (amount, tierIndex) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    const dxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, signer);
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check and approve if needed
    const allowance = await dxn.allowance(account, CONTRACTS.DXNForge);
    if (allowance < amountWei) {
      const approveTx = await dxn.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
      await approveTx.wait();
    }
    
    const tx = await forge.addDXN(amountWei, tierIndex);
    await tx.wait();
    await refreshData();
  };

  const addGOLDToLTS = async (amount, tierIndex) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    const gold = new ethers.Contract(CONTRACTS.GOLDToken, ERC20_ABI, signer);
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check and approve if needed
    const allowance = await gold.allowance(account, CONTRACTS.DXNForge);
    if (allowance < amountWei) {
      const approveTx = await gold.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
      await approveTx.wait();
    }
    
    const tx = await forge.addGOLD(amountWei, tierIndex);
    await tx.wait();
    await refreshData();
  };

  // NEW: Add DXN to ALL tiers (split evenly)
  const addDXNAllToLTS = async (amount) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    const dxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, signer);
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check and approve if needed
    const allowance = await dxn.allowance(account, CONTRACTS.DXNForge);
    if (allowance < amountWei) {
      const approveTx = await dxn.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
      await approveTx.wait();
    }
    
    const tx = await forge.addDXN(amountWei, 5);
    await tx.wait();
    await refreshData();
  };

  // NEW: Add GOLD to ALL tiers (split evenly)
  const addGOLDAllToLTS = async (amount) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    const gold = new ethers.Contract(CONTRACTS.GOLDToken, ERC20_ABI, signer);
    const amountWei = ethers.parseEther(amount.toString());
    
    // Check and approve if needed
    const allowance = await gold.allowance(account, CONTRACTS.DXNForge);
    if (allowance < amountWei) {
      const approveTx = await gold.approve(CONTRACTS.DXNForge, ethers.MaxUint256);
      await approveTx.wait();
    }
    
    const tx = await forge.addGOLD(amountWei, 5);
    await tx.wait();
    await refreshData();
  };

  const mintLTSNFTs = async () => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    
    const tx = await forge.mintNFTs(currentCrucible);
    await tx.wait();
    await refreshData();
  };

  const claimLTS = async (tokenId) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    
    const tx = await forge.claim(tokenId);
    await tx.wait();
    await refreshData();
  };

  const startNewCrucible = async () => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    
    const tx = await forge.startNew();
    await tx.wait();
    await refreshData();
  };

  const takeTierSnapshot = async (tierIndex) => {
    if (!provider || !account) throw new Error('Not connected');
    
    const signer = await provider.getSigner();
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, signer);
    
    const tx = await forge.takeSnap(currentCrucible, tierIndex);
    await tx.wait();
    await refreshData();
  };

  // === HELPER FUNCTIONS ===

  const getTierEthAllocation = (tierIndex) => {
    const snap = tierSnapshots[tierIndex];
    if (!snap || !snap.taken) return '0';
    const total = parseFloat(snap.dxnAlloc) + parseFloat(snap.goldAlloc);
    return total.toFixed(6);
  };

  const getWindowStatus = () => {
    if (isWindowOpen) {
      return {
        status: 'open',
        text: `OPEN — Days ${crucibleInfo.start}-${crucibleInfo.end} (Current: ${currentCycle})`,
      };
    }
    if (windowClosed) {
      return {
        status: 'closed',
        text: `CLOSED — Locked at Day ${crucibleInfo.lock}`,
      };
    }
    if (currentCycle < crucibleInfo.start) {
      return {
        status: 'pending',
        text: `Opens at Day ${crucibleInfo.start} (Current: ${currentCycle})`,
      };
    }
    return { status: 'closed', text: 'CLOSED' };
  };

  return {
    // Loading/error
    loading,
    error,
    
    // Crucible info
    currentCrucible,
    crucibleInfo,
    isWindowOpen,
    windowClosed,
    canStartNewCrucible,
    
    // Cycle/Epoch
    currentCycle,
    currentEpoch,
    
    // Protocol totals
    totalDXNByTier,
    totalGOLDByTier,
    ltsEthBucket,
    ltsBuckets,
    tierSnapshots,
    
    // User state
    userPendingDXN,
    userPendingGOLD,
    userHasMinted,
    userNFTs,
    userStakedDXN,
    userStakedGOLD,
    
    // Write functions
    addDXNToLTS,
    addGOLDToLTS,
    addDXNAllToLTS,
    addGOLDAllToLTS,
    mintLTSNFTs,
    claimLTS,
    startNewCrucible,
    takeTierSnapshot,
    
    // Helpers
    getTierEthAllocation,
    getWindowStatus,
    TIERS,
    refreshData,
  };
}

export default useLTS;