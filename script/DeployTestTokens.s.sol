// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/TestDXN.sol";
import "../contracts/TestXEN.sol";

contract DeployTestTokens is Script {
    function run() external {
        vm.startBroadcast();

        TestXEN xen = new TestXEN();
        console.log("TestXEN deployed at:", address(xen));

        TestDXN dxn = new TestDXN();
        console.log("TestDXN deployed at:", address(dxn));

        vm.stopBroadcast();
    }
}
