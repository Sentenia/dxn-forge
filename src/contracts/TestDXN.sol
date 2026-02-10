// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestDXN
 * @notice Test DXN token for Sepolia with built-in faucet
 * @dev 5M total supply, 1000 DXN per day per user
 */
contract TestDXN is ERC20, Ownable {
    uint256 public constant DRIP_AMOUNT = 1000 * 1e18;        // 1000 DXN per claim
    uint256 public constant DRIP_INTERVAL = 24 hours;         // Once per day
    uint256 public constant TOTAL_SUPPLY = 5_000_000 * 1e18;  // 5M total
    
    mapping(address => uint256) public lastClaim;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Test DXN", "tDXN") Ownable(msg.sender) {
        // Mint total supply to contract
        _mint(address(this), TOTAL_SUPPLY);
    }
    
    /**
     * @notice Claim 1000 test DXN (once per 24 hours)
     */
    function claim() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + DRIP_INTERVAL,
            "Wait 24 hours between claims"
        );
        require(
            balanceOf(address(this)) >= DRIP_AMOUNT,
            "Faucet empty"
        );
        
        lastClaim[msg.sender] = block.timestamp;
        
        _transfer(address(this), msg.sender, DRIP_AMOUNT);
        
        emit Claimed(msg.sender, DRIP_AMOUNT);
    }
    
    /**
     * @notice Get time until next claim available
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaim = lastClaim[user] + DRIP_INTERVAL;
        if (block.timestamp >= nextClaim) return 0;
        return nextClaim - block.timestamp;
    }
    
    /**
     * @notice Owner can refill faucet
     */
    function refill(uint256 amount) external onlyOwner {
        _mint(address(this), amount);
    }
    
    /**
     * @notice Owner can withdraw tokens
     */
    function withdraw(uint256 amount) external onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }
}
