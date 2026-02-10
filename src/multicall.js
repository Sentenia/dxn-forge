import { ethers } from 'ethers';

// Multicall3 is deployed at the same address on all major chains + Sepolia
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';

const MULTICALL_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[])',
  'function getEthBalance(address addr) view returns (uint256 balance)',
];

/**
 * Batch multiple contract read calls into a single RPC call.
 *
 * Usage:
 *   const results = await multicall(provider, [
 *     { contract: forge, fn: 'epoch' },
 *     { contract: forge, fn: 'forgeCycle' },
 *     { contract: dxn, fn: 'balanceOf', args: [address] },
 *   ]);
 *
 * Each result is the decoded return value (unwrapped for single values).
 * Failed calls return null.
 */
export async function multicall(provider, calls) {
  const mc = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);

  const callData = calls.map(({ contract, fn, args = [] }) => ({
    target: contract.target,
    allowFailure: true,
    callData: contract.interface.encodeFunctionData(fn, args),
  }));

  const results = await mc.aggregate3.staticCall(callData);

  return results.map((result, i) => {
    if (!result.success) return null;
    try {
      const decoded = calls[i].contract.interface.decodeFunctionResult(calls[i].fn, result.returnData);
      // Unwrap single values for convenience
      return decoded.length === 1 ? decoded[0] : decoded;
    } catch {
      return null;
    }
  });
}

/**
 * Get ETH balance of an address via multicall (avoidng a separate RPC call).
 * Can be included as part of a regular multicall batch.
 */
export function ethBalanceCall(address) {
  const mc = new ethers.Contract(MULTICALL3, MULTICALL_ABI);
  return {
    contract: mc,
    fn: 'getEthBalance',
    args: [address],
  };
}