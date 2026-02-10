// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IXEN {
    function burn(address user, uint256 amount) external;
}

interface IDXNForge {
    function addTickets(address user, uint256 tix) external payable;
}

contract XenBurner is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address private constant DEAD = 0x000000000000000000000000000000000000dEaD;

    uint256 public constant XEN_BATCH = 2_500_000 * 1e18;
    uint256 public constant BASE_FEE  = 0.000012 ether;
    uint256 public constant TIX_DEC   = 1e18;
    uint256 public constant BATCH_TIX = 10000;

    IERC20 public immutable XEN_TOKEN;
    IXEN   public immutable XEN;
    IDXNForge public immutable FORGE;

    bool public realBurn;

    uint256 public xenBurned;
    uint256 public xenFees;
    mapping(address => uint256) public userXenBurned;

    event XenBurn(address indexed u, uint256 batch, uint256 xen, uint256 tix, uint256 fee);

    error InsuffFee();
    error NoBatch();
    error Fail();

    constructor(
        address _xen,
        address _forge,
        address _owner
    ) Ownable(_owner) {
        XEN_TOKEN = IERC20(_xen);
        XEN = IXEN(_xen);
        FORGE = IDXNForge(_forge);
    }

    function setRealBurn(bool _on) external onlyOwner { realBurn = _on; }

    function calcFee(uint256 b) public pure returns (uint256 fee, uint256 disc) {
        if (b == 0) return (0, 0);
        disc = b / 2;
        if (disc > 5000) disc = 5000;
        fee = (BASE_FEE * b * (10000 - disc)) / 10000;
    }

    function burnXEN(uint256 b) external payable nonReentrant {
        if (b == 0) revert NoBatch();
        (uint256 fee, ) = calcFee(b);
        if (msg.value < fee) revert InsuffFee();

        // Burn XEN
        uint256 xen = b * XEN_BATCH;
        if (realBurn) {
            XEN_TOKEN.safeTransferFrom(msg.sender, address(this), xen);
            XEN.burn(msg.sender, xen);
        } else {
            XEN_TOKEN.safeTransferFrom(msg.sender, DEAD, xen);
        }

        // Credit tickets on Forge (fee ETH forwarded with call)
        uint256 tix = (b * TIX_DEC) / BATCH_TIX;
        FORGE.addTickets{value: fee}(msg.sender, tix);

        // Stats
        xenBurned += xen;
        xenFees += fee;
        userXenBurned[msg.sender] += xen;

        // Refund excess
        if (msg.value > fee) {
            (bool ok, ) = msg.sender.call{value: msg.value - fee}("");
            if (!ok) revert Fail();
        }

        emit XenBurn(msg.sender, b, xen, tix, fee);
    }
}
