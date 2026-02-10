// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GOLDToken is ERC20, Ownable {
    address public forge;

    error OnlyForge();
    error AlreadySet();

    constructor(address _owner) ERC20("DXN GOLD", "GOLD") Ownable(_owner) {}

    function setForge(address _forge) external onlyOwner {
        if (forge != address(0)) revert AlreadySet();
        forge = _forge;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != forge) revert OnlyForge();
        _mint(to, amount);
    }
}
