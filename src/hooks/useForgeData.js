import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, NETWORK, ERC20_ABI, FORGE_ABI, GOLD_ABI, MOCK_DBXEN_ABI, DBXEN_ABI, XENBURNER_ABI, getReadProvider } from '../contracts';

const pubProvider = getReadProvider();
const isRealDBXen = NETWORK === 'mainnet-fork' || NETWORK === 'mainnet';

export function useForgeData() {
  const { address, connected } = useWallet();

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);
  const phase2Done = useRef(false);

  const [protocol, setProtocol] = useState({
    currentEpoch: 0,
    currentCycle: 0,
    epochMultiplier: 1,
    claimableEth: '0',
    pendingBuyBurnEth: '0',
    totalDXNPending: '0',
    totalDXNStaked: '0',
    totalAutoStakedGold: '0',
    totalManualGoldStaked: '0',
    goldSupply: '0',
    goldTotalSupply: '0',
    ticketsThisEpoch: 0,
    stakerTickets: 0,
    burnerTickets: 0,
    canClaimFees: false,
    lastClaimFeesTime: 0,
    globalLtsDXN: '0',
    globalLtsGold: '0',
    pendingLts: '0',
    forgeBalance: '0',
    goldStakersPool: '0',
    xenFees: '0',
    totalXenBurned: '0',
  });

  const [user, setUser] = useState({
    dxnBalance: '0',
    goldBalance: '0',
    xenBalance: '0',
    dxnPending: '0',
    dxnStaked: '0',
    dxnUnlockCycle: 0,
    autoStakedGold: '0',
    manualGoldPending: '0',
    manualGoldStaked: '0',
    pendingEth: '0',
    pendingTickets: '0',
    totalTickets: '0',
    pendingGoldReward: '0',
    dxnAllowance: '0',
    goldAllowance: '0',
  });

  const fetching = useRef(false);

  // PHASE 1: Essential data for immediate UI (user balances, epoch/cycle)
  const fetchEssentials = useCallback(async () => {
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);

    // Get minimal protocol data needed for actions
    const [currentEpoch, currentCycle, epochMultiplier, canClaimFees, lastFeeTime] = await Promise.all([
      forge.epoch(),
      forge.forgeCycle(),
      forge.mult(),
      forge.canFee(),
      forge.lastFeeTime(),
    ]);

    // Update protocol with essentials first
    setProtocol(prev => ({
      ...prev,
      currentEpoch: Number(currentEpoch),
      currentCycle: Number(currentCycle),
      epochMultiplier: Number(epochMultiplier),
      canClaimFees,
      lastClaimFeesTime: Number(lastFeeTime),
    }));

    // Fetch user data if connected
    if (connected && address) {
      const uForge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);
      const uDxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, pubProvider);
      const uGold = new ethers.Contract(CONTRACTS.GOLDToken, ERC20_ABI, pubProvider);
      const uXen = new ethers.Contract(CONTRACTS.tXEN, ERC20_ABI, pubProvider);

      const [
        dxnBal,
        goldBal,
        xenBal,
        userDXN,
        autoGold,
        manualGold,
        pendingEth,
        pendingTickets,
        userTickets,
        dxnAllowance,
        goldAllowance,
      ] = await Promise.all([
        uDxn.balanceOf(address),
        uGold.balanceOf(address),
        uXen.balanceOf(address),
        uForge.userDXN(address),
        uForge.autoGold(address),
        uForge.manualGold(address),
        uForge.pendEth(address),
        uForge.pendTix(address),
        uForge.userTix(address),
        uDxn.allowance(address, CONTRACTS.DXNForge),
        uGold.allowance(address, CONTRACTS.DXNForge),
      ]);

      setUser({
        dxnBalance: ethers.formatEther(dxnBal),
        goldBalance: ethers.formatEther(goldBal),
        xenBalance: ethers.formatEther(xenBal),
        dxnPending: ethers.formatEther(userDXN[0]),
        dxnStaked: ethers.formatEther(userDXN[1]),
        dxnUnlockCycle: Number(userDXN[2]),
        autoStakedGold: ethers.formatEther(autoGold),
        manualGoldPending: ethers.formatEther(manualGold[0]),
        manualGoldStaked: ethers.formatEther(manualGold[1]),
        pendingEth: ethers.formatEther(pendingEth),
        pendingTickets: ethers.formatEther(pendingTickets),
        totalTickets: ethers.formatEther(userTickets),
        pendingGoldReward: '0', // Calculated in phase 2
        dxnAllowance: ethers.formatEther(dxnAllowance),
        goldAllowance: ethers.formatEther(goldAllowance),
      });
    }

    return { currentEpoch: Number(currentEpoch) };
  }, [address, connected]);

  // PHASE 2: Protocol stats (delayed, non-essential for actions)
  const fetchProtocolStats = useCallback(async (currentEpochNum) => {
    const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);
    const gold = new ethers.Contract(CONTRACTS.GOLDToken, GOLD_ABI, pubProvider);
    const xenBurner = new ethers.Contract(CONTRACTS.XenBurner, XENBURNER_ABI, pubProvider);

    // ── DBXen claimable ETH: use correct ABI per network ──
    let dbxenClaimable = 0n;
    const dbxenAddress = CONTRACTS.MockDBXEN || CONTRACTS.DBXen;

    if (isRealDBXen) {
      // Real DBXen: accAccruedFees(forgeAddress) = what Forge can claim
      const dbxen = new ethers.Contract(dbxenAddress, DBXEN_ABI, pubProvider);
      try {
        dbxenClaimable = await dbxen.accAccruedFees(CONTRACTS.DXNForge);
      } catch (e) {
        console.warn('accAccruedFees call failed:', e.message);
        dbxenClaimable = 0n;
      }
    } else {
      // Sepolia MockDBXEN: simple claimableEth() getter
      const dbxen = new ethers.Contract(dbxenAddress, MOCK_DBXEN_ABI, pubProvider);
      try {
        dbxenClaimable = await dbxen.claimableEth();
      } catch (e) {
        console.warn('claimableEth call failed:', e.message);
        dbxenClaimable = 0n;
      }
    }

    const [
      pendingBuyBurnEth,
      totalDXNPending,
      totalDXNStaked,
      totalAutoStakedGold,
      totalManualGoldStaked,
      ticketsThisEpoch,
      stakerTixEpoch,
      lastFeeTime,
      pendingLts,
      globalLtsDXN,
      globalLtsGold,
      forgeBalance,
      allocLts,
      totEthDist,
      xenFees,
      goldTotalSupply,
      totalXenBurned,
    ] = await Promise.all([
      forge.pendingBurn(),
      forge.dxnPending(),
      forge.dxnStaked(),
      forge.totAutoGold(),
      forge.manualStaked(),
      forge.tixEpoch(),
      forge.stakerTixEpoch(),
      forge.lastFeeTime(),
      forge.pendingLts(),
      forge.globalLtsDXN(),
      forge.globalLtsGold(),
      pubProvider.getBalance(CONTRACTS.DXNForge),
      forge.allocLts(),
      forge.totEthDist(),
      xenBurner.xenFees(),
      gold.totalSupply(),
      xenBurner.xenBurned(),
    ]);

    // claimableEth = what DBXen will send Forge on next claimFees()
    // This is the correct value — accAccruedFees(forge) on real DBXen,
    // or claimableEth() on MockDBXEN for Sepolia
    const claimableTotal = dbxenClaimable;

    // Calculate total GOLD minted (limit to last 10 epochs to avoid slowdown)
    let totalGoldMinted = BigInt(0);
    const startEpoch = Math.max(1, currentEpochNum - 10);
    for (let i = startEpoch; i < currentEpochNum; i++) {
      try {
        const done = await forge.epDone(i);
        if (done) {
          const epGoldAmt = await forge.epGold(i);
          totalGoldMinted += epGoldAmt;
        }
      } catch (e) {
        // Skip if epoch doesn't exist
      }
    }

    setProtocol(prev => ({
      ...prev,
      pendingBuyBurnEth: ethers.formatEther(pendingBuyBurnEth),
      totalDXNPending: ethers.formatEther(totalDXNPending),
      totalDXNStaked: ethers.formatEther(totalDXNStaked),
      totalAutoStakedGold: ethers.formatEther(totalAutoStakedGold),
      totalManualGoldStaked: ethers.formatEther(totalManualGoldStaked),
      ticketsThisEpoch: Number(ethers.formatEther(ticketsThisEpoch)),
      stakerTickets: Number(ethers.formatEther(stakerTixEpoch)),
      burnerTickets: Number(ethers.formatEther(ticketsThisEpoch - stakerTixEpoch)),
      lastClaimFeesTime: Number(lastFeeTime),
      claimableEth: ethers.formatEther(claimableTotal),
      goldSupply: ethers.formatEther(totalGoldMinted),
      goldTotalSupply: ethers.formatEther(goldTotalSupply),
      globalLtsDXN: ethers.formatEther(globalLtsDXN),
      globalLtsGold: ethers.formatEther(globalLtsGold),
      pendingLts: ethers.formatEther(pendingLts),
      forgeBalance: ethers.formatEther(forgeBalance),
      goldStakersPool: ethers.formatEther(totEthDist),
      xenFees: ethers.formatEther(xenFees),
      totalXenBurned: ethers.formatEther(totalXenBurned),
    }));

    // Calculate pending GOLD reward if user has tickets
    if (connected && address) {
      const uForge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);
      const userTickets = await uForge.userTix(address);

      if (currentEpochNum > 1 && userTickets > 0) {
        try {
          const prevEpoch = currentEpochNum - 1;
          const [epTixPrev, epGoldPrev, epDonePrev] = await Promise.all([
            uForge.epTix(prevEpoch),
            uForge.epGold(prevEpoch),
            uForge.epDone(prevEpoch),
          ]);
          if (epDonePrev && epTixPrev > 0) {
            const pendingGoldReward = (userTickets * epGoldPrev) / epTixPrev;
            setUser(prev => ({
              ...prev,
              pendingGoldReward: ethers.formatEther(pendingGoldReward),
            }));
          }
        } catch (err) {
          console.error('Error fetching epoch data:', err);
        }
      }
    }
  }, [address, connected]);

  // Main refetch function with two phases
  // force=true skips the fetching guard and delay (use after transactions)
  const refetch = useCallback(async (force = false) => {
    // Skip if already fetching, unless forced
    if (fetching.current && !force) return;
    fetching.current = true;

    if (!initialLoadDone.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // PHASE 1: Immediate essentials
      const { currentEpoch } = await fetchEssentials();

      setLoading(false);
      initialLoadDone.current = true;

      // PHASE 2: Protocol stats
      // Only delay on initial load, not on forced refetch (after tx)
      if (!phase2Done.current && !force) {
        setStatsLoading(true);
        await new Promise(r => setTimeout(r, 1000));
      }

      await fetchProtocolStats(currentEpoch);

      setStatsLoading(false);
      phase2Done.current = true;

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
      setStatsLoading(false);
    }

    fetching.current = false;
  }, [fetchEssentials, fetchProtocolStats]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { loading, statsLoading, error, protocol, user, refetch };
}