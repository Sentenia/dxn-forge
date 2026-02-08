/**
 * Contract Error Handler
 * Maps Solidity custom error selectors to user-friendly messages
 */

// Error selector -> Human-readable message mapping
// Selectors are first 4 bytes of keccak256(error_signature)
export const FORGE_ERRORS = {
  // Claim errors
  "0xf4560403": "Nothing to claim — you have no GOLD rewards or claimable ETH yet.",
  "0x4feeb914": "Insufficient balance for this action.",
  "0x74e4ead5": "Cooldown active — wait 24 hours between fee claims.",
  "0xbd6b1951": "Must wait for next DBXen cycle.",
  "0x6d7ae632": "Transaction failed — please try again.",

  // LTS Crucible errors
  "0x12f1f923": "Deposit window is closed for this Crucible.",
  "0x5a7b3282": "Deposit window is still open — wait for it to close.",
  "0xf1154826": "NFTs already minted for this Crucible.",
  "0x318cebaf": "No deposits to mint NFTs for.",
  "0x55ca1f58": "Position not mature yet — check unlock date.",
  "0xa42637bc": "Already claimed this position.",
  "0x2a9ffb71": "Invalid tier selected.",
  "0x30cd7471": "You don't own this NFT.",
  "0xbcb8b8f1": "Can't start new Crucible yet.",

  // XEN Burn errors
  "0x6a12f104": "Insufficient ETH sent for fee.",
  "0xa44a178f": "Must specify at least 1 batch.",
  "0x13f1ac0b": "No tickets in this epoch yet.",

  // Buy & Burn errors
  "0x61e8e1a4": "No ETH available for buy & burn.",

  // Common ERC20/Allowance errors
  "0xfb8f41b2": "Insufficient allowance — please approve tokens first.",
  "0xe450d38c": "Insufficient token balance.",
};

/**
 * Extract error selector from various error formats
 * @param {Error} error - The error object from ethers.js
 * @returns {string|null} - The 4-byte error selector or null
 */
export function extractErrorSelector(error) {
  // Check error.data directly (ethers v6 format)
  if (error.data && typeof error.data === 'string' && error.data.startsWith('0x')) {
    return error.data.slice(0, 10).toLowerCase();
  }

  // Check error.error.data (nested format)
  if (error.error?.data && typeof error.error.data === 'string') {
    return error.error.data.slice(0, 10).toLowerCase();
  }

  // Check error.info.error.data (ethers v6 nested format)
  if (error.info?.error?.data && typeof error.info.error.data === 'string') {
    return error.info.error.data.slice(0, 10).toLowerCase();
  }

  // Try to extract from error message (some providers include it)
  const match = error.message?.match(/data="(0x[a-fA-F0-9]+)"/);
  if (match) {
    return match[1].slice(0, 10).toLowerCase();
  }

  // Try revert data in transaction receipt
  if (error.receipt?.data) {
    return error.receipt.data.slice(0, 10).toLowerCase();
  }

  return null;
}

/**
 * Parse contract error and return user-friendly message
 * @param {Error} error - The error object from a failed transaction
 * @returns {string} - User-friendly error message
 */
export function parseContractError(error) {
  try {
    // Handle null/undefined error
    if (!error) {
      return 'An unknown error occurred.';
    }

    // Check if user rejected the transaction
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      return 'Transaction cancelled by user.';
    }

    // Check for insufficient funds for gas
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient ETH for gas fees.';
    }

    // Check for network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return 'Network error — please check your connection and try again.';
    }

    // Try to extract error selector
    const selector = extractErrorSelector(error);

    if (selector && FORGE_ERRORS[selector]) {
      console.log('[parseContractError] Matched selector:', selector, '->', FORGE_ERRORS[selector]);
      return FORGE_ERRORS[selector];
    }

    // Check if there's a reason string
    if (error.reason) {
      // Clean up common reason formats
      const reason = error.reason
        .replace('execution reverted: ', '')
        .replace('Error: ', '');
      return reason;
    }

    // Check for revert reason in error message
    if (error.message) {
      // Look for revert reason
      const revertMatch = error.message.match(/reverted with reason string '([^']+)'/);
      if (revertMatch) {
        return revertMatch[1];
      }

      // Look for custom error name
      const customErrorMatch = error.message.match(/reverted with custom error '([^']+)'/);
      if (customErrorMatch) {
        return `Error: ${customErrorMatch[1]}`;
      }
    }

    // Check shortMessage (ethers v6)
    if (error.shortMessage) {
      return error.shortMessage.replace('execution reverted', 'Transaction reverted');
    }

    // Default fallback
    return 'Transaction reverted — please try again.';
  } catch (parseError) {
    console.error('[parseContractError] Failed to parse error:', parseError);
    return 'Transaction failed — please try again.';
  }
}

/**
 * Log error details for debugging (only in development)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
export function logContractError(context, error) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Contract Error: ${context}`);
    console.error('Full error:', error);
    console.log('Error code:', error.code);
    console.log('Error reason:', error.reason);
    console.log('Error data:', error.data);
    console.log('Error info:', error.info);
    console.log('Extracted selector:', extractErrorSelector(error));
    console.groupEnd();
  }
}
