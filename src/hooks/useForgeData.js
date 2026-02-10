import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, NETWORK, ERC20_ABI, FORGE_ABI, GOLD_ABI, MOCK_DBXEN_ABI, DBXEN_ABI, XENBURNER_ABI, getReadProvider } from '../contracts';
import { multicall, ethBalanceCall } from '../multicall';

const pubProvider = getReadProvider();
const isRealDBXen = NETWORK === 'mainnet-fork' || NETWORK === 'mainnet';

// Pre-create contract instances (reused across fetches)
const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);
const gold = new ethers.Contract(CONTRACTS.GOLDToken, GOLD_ABI, pubProvider);
const dxnToken = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, pubProvider);
const xenToken = new ethers.Contract(CONTRACTS.tXEN, ERC20_ABI, pubProvider);
const xenBurner = new ethers.Contract(CONTRACTS.XenBurner, XENBURNER_ABI, pubProvider);

const dbxenAddress = CONTRACTS.MockDBXEN || CONTRACTS.DBXen;
const dbxen = new ethers.Contract(
  dbxenAddress,
  isRealDBXen ? DBXEN_ABI : MOCK_DBXEN_ABI,
  pubProvider
);

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

  // ── PHASE 1: Essential data in ONE multicall ──
  const fetchEssentials = useCallback(async () => {
    const calls = [
      { contract: forge, fn: 'epoch' },           // 0
      { contract: forge, fn: 'forgeCycle' },       // 1
      { contract: forge, fn: 'mult' },             // 2
      { contract: forge, fn: 'canFee' },           // 3
      { contract: forge, fn: 'lastFeeTime' },      // 4
    ];

    // Add user calls if connected (indices 5-15)
    if (connected && address) {
      calls.push(
        { contract: dxnToken, fn: 'balanceOf', args: [address] },                    // 5
        { contract: gold, fn: 'balanceOf', args: [address] },                         // 6
        { contract: xenToken, fn: 'balanceOf', args: [address] },                     // 7
        { contract: forge, fn: 'userDXN', args: [address] },                          // 8
        { contract: forge, fn: 'autoGold', args: [address] },                         // 9
        { contract: forge, fn: 'manualGold', args: [address] },                       // 10
        { contract: forge, fn: 'pendEth', args: [address] },                          // 11
        { contract: forge, fn: 'pendTix', args: [address] },                          // 12
        { contract: forge, fn: 'userTix', args: [address] },                          // 13
        { contract: dxnToken, fn: 'allowance', args: [address, CONTRACTS.DXNForge] }, // 14
        { contract: gold, fn: 'allowance', args: [address, CONTRACTS.DXNForge] },     // 15
      );
    }

    // ONE RPC call for everything
    const r = await multicall(pubProvider, calls);

    const currentEpoch = Number(r[0] || 0);
    const currentCycle = Number(r[1] || 0);

    setProtocol(prev => ({
      ...prev,
      currentEpoch,
      currentCycle,
      epochMultiplier: Number(r[2] || 1),
      canClaimFees: r[3] || false,
      lastClaimFeesTime: Number(r[4] || 0),
    }));

    if (connected && address) {
      const userDXN = r[8];     // [pending, staked, unlock]
      const manualGold = r[10]; // [pending, staked, earnCy, unlockCy, counted]

      setUser({
        dxnBalance: ethers.formatEther(r[5] || 0n),
        goldBalance: ethers.formatEther(r[6] || 0n),
        xenBalance: ethers.formatEther(r[7] || 0n),
        dxnPending: ethers.formatEther(userDXN?.[0] || 0n),
        dxnStaked: ethers.formatEther(userDXN?.[1] || 0n),
        dxnUnlockCycle: Number(userDXN?.[2] || 0),
        autoStakedGold: ethers.formatEther(r[9] || 0n),
        manualGoldPending: ethers.formatEther(manualGold?.[0] || 0n),
        manualGoldStaked: ethers.formatEther(manualGold?.[1] || 0n),
        pendingEth: ethers.formatEther(r[11] || 0n),
        pendingTickets: ethers.formatEther(r[12] || 0n),
        totalTickets: ethers.formatEther(r[13] || 0n),
        pendingGoldReward: '0',
        dxnAllowance: ethers.formatEther(r[14] || 0n),
        goldAllowance: ethers.formatEther(r[15] || 0n),
      });
    }

    return { currentEpoch };
  }, [address, connected]);

  // ── PHASE 2: Protocol stats in ONE multicall ──
  const fetchProtocolStats = useCallback(async (currentEpochNum) => {
    const calls = [
      // 0: DBXen claimable
      isRealDBXen
        ? { contract: dbxen, fn: 'accAccruedFees', args: [CONTRACTS.DXNForge] }
        : { contract: dbxen, fn: 'claimableEth' },
      // Forge stats
      { contract: forge, fn: 'pendingBurn' },      // 1
      { contract: forge, fn: 'dxnPending' },       // 2
      { contract: forge, fn: 'dxnStaked' },        // 3
      { contract: forge, fn: 'totAutoGold' },      // 4
      { contract: forge, fn: 'manualStaked' },      // 5
      { contract: forge, fn: 'tixEpoch' },         // 6
      { contract: forge, fn: 'stakerTixEpoch' },   // 7
      { contract: forge, fn: 'lastFeeTime' },      // 8
      { contract: forge, fn: 'pendingLts' },       // 9
      { contract: forge, fn: 'globalLtsDXN' },     // 10
      { contract: forge, fn: 'globalLtsGold' },    // 11
      ethBalanceCall(CONTRACTS.DXNForge),           // 12 (ETH balance via multicall3)
      { contract: forge, fn: 'allocLts' },         // 13
      { contract: forge, fn: 'totEthDist' },       // 14
      { contract: xenBurner, fn: 'xenFees' },      // 15
      { contract: gold, fn: 'totalSupply' },       // 16
      { contract: xenBurner, fn: 'xenBurned' },    // 17
    ];

    // Batch epoch history calls too (no more loop of individual calls!)
    const startEpoch = Math.max(1, currentEpochNum - 10);
    const epochBaseIndex = calls.length; // 18
    for (let i = startEpoch; i < currentEpochNum; i++) {
      calls.push(
        { contract: forge, fn: 'epDone', args: [i] },
        { contract: forge, fn: 'epGold', args: [i] },
      );
    }

    // Add user ticket data if connected
    let userTixIndex = -1;
    if (connected && address) {
      userTixIndex = calls.length;
      calls.push({ contract: forge, fn: 'userTix', args: [address] });

      if (currentEpochNum > 1) {
        calls.push(
          { contract: forge, fn: 'epTix', args: [currentEpochNum - 1] },
          { contract: forge, fn: 'epGold', args: [currentEpochNum - 1] },
          { contract: forge, fn: 'epDone', args: [currentEpochNum - 1] },
        );
      }
    }

    // ONE RPC call for all protocol stats + epoch history + user rewards
    const r = await multicall(pubProvider, calls);

    const dbxenClaimable = r[0] || 0n;
    const ticketsThisEpoch = r[6] || 0n;
    const stakerTixEpoch = r[7] || 0n;

    // Calculate total GOLD minted from batched epoch history
    let totalGoldMinted = 0n;
    for (let i = startEpoch; i < currentEpochNum; i++) {
      const offset = (i - startEpoch) * 2;
      const done = r[epochBaseIndex + offset];
      const epGold = r[epochBaseIndex + offset + 1];
      if (done && epGold) {
        totalGoldMinted += epGold;
      }
    }

    setProtocol(prev => ({
      ...prev,
      claimableEth: ethers.formatEther(dbxenClaimable),
      pendingBuyBurnEth: ethers.formatEther(r[1] || 0n),
      totalDXNPending: ethers.formatEther(r[2] || 0n),
      totalDXNStaked: ethers.formatEther(r[3] || 0n),
      totalAutoStakedGold: ethers.formatEther(r[4] || 0n),
      totalManualGoldStaked: ethers.formatEther(r[5] || 0n),
      ticketsThisEpoch: Number(ethers.formatEther(ticketsThisEpoch)),
      stakerTickets: Number(ethers.formatEther(stakerTixEpoch)),
      burnerTickets: Number(ethers.formatEther(ticketsThisEpoch - stakerTixEpoch)),
      lastClaimFeesTime: Number(r[8] || 0),
      pendingLts: ethers.formatEther(r[9] || 0n),
      globalLtsDXN: ethers.formatEther(r[10] || 0n),
      globalLtsGold: ethers.formatEther(r[11] || 0n),
      forgeBalance: ethers.formatEther(r[12] || 0n),
      goldStakersPool: ethers.formatEther(r[14] || 0n),
      xenFees: ethers.formatEther(r[15] || 0n),
      goldTotalSupply: ethers.formatEther(r[16] || 0n),
      totalXenBurned: ethers.formatEther(r[17] || 0n),
      goldSupply: ethers.formatEther(totalGoldMinted),
    }));

    // Calculate pending GOLD reward
    if (connected && address && userTixIndex >= 0) {
      const userTickets = r[userTixIndex] || 0n;

      if (currentEpochNum > 1 && userTickets > 0n) {
        const epTixPrev = r[userTixIndex + 1] || 0n;
        const epGoldPrev = r[userTixIndex + 2] || 0n;
        const epDonePrev = r[userTixIndex + 3] || false;

        if (epDonePrev && epTixPrev > 0n) {
          const pendingGoldReward = (userTickets * epGoldPrev) / epTixPrev;
          setUser(prev => ({
            ...prev,
            pendingGoldReward: ethers.formatEther(pendingGoldReward),
          }));
        }
      }
    }
  }, [address, connected]);

  // ── Main refetch with two phases ──
  const refetch = useCallback(async (force = false) => {
    if (fetching.current && !force) return;
    fetching.current = true;

    if (!initialLoadDone.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // PHASE 1: 1 multicall for essentials
      const { currentEpoch } = await fetchEssentials();

      setLoading(false);
      initialLoadDone.current = true;

      // PHASE 2: 1 multicall for protocol stats
      if (!phase2Done.current && !force) {
        setStatsLoading(true);
        await new Promise(r => setTimeout(r, 500));
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