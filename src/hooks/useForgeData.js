import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, ERC20_ABI, FORGE_ABI, GOLD_ABI, MOCK_DBXEN_ABI, getReadProvider } from '../contracts';

const pubProvider = getReadProvider();
const userRpc = pubProvider;

export function useForgeData() {
  const { address, connected } = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadDone = useRef(false);
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

  const refetch = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;

    if (!initialLoadDone.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // Protocol contracts on Alchemy
      const forge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, pubProvider);
      const gold = new ethers.Contract(CONTRACTS.GOLDToken, GOLD_ABI, pubProvider);
      const dxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, pubProvider);
      const dbxen = new ethers.Contract(CONTRACTS.MockDBXEN, MOCK_DBXEN_ABI, pubProvider);

      // Batch 1: core protocol data
      const [
        currentEpoch,
        currentCycle,
        epochMultiplier,
        pendingBuyBurnEth,
        totalDXNPending,
        totalDXNStaked,
        totalAutoStakedGold,
        totalManualGoldStaked,
        ticketsThisEpoch,
        stakerTixEpoch,
      ] = await Promise.all([
        forge.epoch(),
        forge.cycle(),
        forge.mult(),
        forge.pendingBurn(),
        forge.dxnPending(),
        forge.dxnStaked(),
        forge.totAutoGold(),
        forge.manualStaked(),
        forge.tixEpoch(),
        forge.stakerTixEpoch(),
      ]);

      // Small gap between batches
      await new Promise(r => setTimeout(r, 300));

      // Batch 2: balances and remaining protocol data
      const [
        canClaimFees,
        lastFeeTime,
        dbxenBalance,
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
        forge.canFee(),
        forge.lastFeeTime(),
        pubProvider.getBalance(CONTRACTS.MockDBXEN),
        forge.pendingLts(),
        forge.globalLtsDXN(),
        forge.globalLtsGold(),
        pubProvider.getBalance(CONTRACTS.DXNForge),
        forge.allocLts(),
        forge.totEthDist(),
        forge.xenFees(),
        gold.totalSupply(),
        forge.xenBurned(),
      ]);

      // Undistributed ETH sitting in Forge (xen burn fees etc.)
      const undistributed = forgeBalance - pendingBuyBurnEth - pendingLts - allocLts;

      // Claimable = DBXen fees + undistributed Forge ETH
      const claimableTotal = dbxenBalance + (undistributed > 0n ? undistributed : 0n);

      // Calculate total GOLD minted from completed epochs
      let totalGoldMinted = BigInt(0);
      const currentEp = Number(currentEpoch);
      for (let i = 1; i < currentEp; i++) {
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

      console.log('TICKETS DEBUG:', ticketsThisEpoch.toString(), stakerTixEpoch.toString(), ethers.formatEther(ticketsThisEpoch), Number(ethers.formatEther(ticketsThisEpoch)));

      setProtocol({
        currentEpoch: Number(currentEpoch),
        currentCycle: Number(currentCycle),
        epochMultiplier: Number(epochMultiplier),
        pendingBuyBurnEth: ethers.formatEther(pendingBuyBurnEth),
        totalDXNPending: ethers.formatEther(totalDXNPending),
        totalDXNStaked: ethers.formatEther(totalDXNStaked),
        totalAutoStakedGold: ethers.formatEther(totalAutoStakedGold),
        totalManualGoldStaked: ethers.formatEther(totalManualGoldStaked),
        ticketsThisEpoch: Number(ethers.formatEther(ticketsThisEpoch)),
        stakerTickets: Number(ethers.formatEther(stakerTixEpoch)),
        burnerTickets: Number(ethers.formatEther(ticketsThisEpoch - stakerTixEpoch)),
        canClaimFees,
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
      });

      // Fetch user data if connected — uses separate RPC to avoid throttling
      if (connected && address) {
        const uForge = new ethers.Contract(CONTRACTS.DXNForge, FORGE_ABI, userRpc);
        const uGold = new ethers.Contract(CONTRACTS.GOLDToken, GOLD_ABI, userRpc);
        const uDxn = new ethers.Contract(CONTRACTS.tDXN, ERC20_ABI, userRpc);
        const uXen = new ethers.Contract(CONTRACTS.tXEN, ERC20_ABI, userRpc);

        try {
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

          // Calculate pending GOLD reward from previous epoch
          let pendingGoldReward = BigInt(0);
          const epochNum = Number(currentEpoch);
          if (epochNum > 1 && userTickets > 0) {
            try {
              const prevEpoch = epochNum - 1;
              const [epTixPrev, epGoldPrev, epDonePrev] = await Promise.all([
                uForge.epTix(prevEpoch),
                uForge.epGold(prevEpoch),
                uForge.epDone(prevEpoch),
              ]);
              if (epDonePrev && epTixPrev > 0) {
                pendingGoldReward = (userTickets * epGoldPrev) / epTixPrev;
              }
            } catch (err) {
              console.error('Error fetching epoch data:', err);
            }
          }

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
            pendingGoldReward: ethers.formatEther(pendingGoldReward),
            dxnAllowance: ethers.formatEther(dxnAllowance),
            goldAllowance: ethers.formatEther(goldAllowance),
          });
        } catch (userErr) {
          console.warn('User data fetch failed, will retry:', userErr.message);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    }

    setLoading(false);
    initialLoadDone.current = true;
    fetching.current = false;
  }, [address, connected]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(refetch, 60000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { loading, error, protocol, user, refetch };
}