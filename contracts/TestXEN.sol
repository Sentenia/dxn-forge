// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestXEN is ERC20, Ownable {
    uint256 public constant DRIP_AMOUNT = 1_000_000_000 * 1e18;
    uint256 public constant DRIP_INTERVAL = 24 hours;
    uint256 public constant TOTAL_SUPPLY = 273_000_000_000_000 * 1e18;
    uint256 public constant OWNER_INITIAL = 1_000_000_000_000 * 1e18;
    
    mapping(address => uint256) public lastClaim;
    
    event Claimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Test XEN", "tXEN") Ownable(msg.sender) {
        _mint(msg.sender, OWNER_INITIAL);
        _mint(address(this), TOTAL_SUPPLY - OWNER_INITIAL);
    }
    
    function claim() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + DRIP_INTERVAL,
            "Wait 24 hours between claims"
        );
        require(balanceOf(address(this)) >= DRIP_AMOUNT, "Faucet empty");
        
        lastClaim[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, DRIP_AMOUNT);
        emit Claimed(msg.sender, DRIP_AMOUNT);
    }
    
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaim = lastClaim[user] + DRIP_INTERVAL;
        if (block.timestamp >= nextClaim) return 0;
        return nextClaim - block.timestamp;
    }
    
    function ownerClaim(uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Faucet empty");
        _transfer(address(this), msg.sender, amount);
    }
    
    function refill(uint256 amount) external onlyOwner {
        _mint(address(this), amount);
    }
    
    function withdraw(uint256 amount) external onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }
}
