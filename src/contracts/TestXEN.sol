// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestXEN
 * @notice Test XEN token for Sepolia with built-in faucet
 * @dev 273T total supply, 1B XEN per day per user, owner gets 1T initial
 */
contract TestXEN is ERC20, Ownable {
    uint256 public constant DRIP_AMOUNT = 1_000_000_000 * 1e18;     // 1 billion per claim
    uint256 public constant DRIP_INTERVAL = 24 hours;                // Once per day
    uint256 public constant TOTAL_SUPPLY = 273_000_000_000_000 * 1e18; // 273 trillion
    uint256 public constant OWNER_INITIAL = 1_000_000_000_000 * 1e18;  // 1 trillion
    
    mapping(address => uint256) public lastClaim;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Test XEN", "tXEN") Ownable(msg.sender) {
        // Give owner 1 trillion
        _mint(msg.sender, OWNER_INITIAL);
        
        // Rest goes to faucet
        _mint(address(this), TOTAL_SUPPLY - OWNER_INITIAL);
    }
    
    /**
     * @notice Claim 1 billion test XEN (once per 24 hours)
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
     * @notice Owner can claim any amount (for testing)
     */
    function ownerClaim(uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Faucet empty");
        _transfer(address(this), msg.sender, amount);
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
