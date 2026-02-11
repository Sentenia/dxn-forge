// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IXEN {
    function burn(address user, uint256 amount) external;
}

interface IBurnRedeemable {
    function onTokenBurned(address user, uint256 amount) external;
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IDXNForge {
    function addTickets(address user, uint256 tix) external payable;
}

contract XenBurner is Ownable, ReentrancyGuard, IERC165, IBurnRedeemable {
    using SafeERC20 for IERC20;

    uint256 public constant XEN_BATCH = 2_500_000 * 1e18;
    uint256 public constant BASE_FEE  = 0.000012 ether;
    uint256 public constant TIX_DEC   = 1e18;
    uint256 public constant BATCH_TIX = 10000;

    IERC20 public immutable XEN_TOKEN;
    IXEN   public immutable XEN;
    IDXNForge public immutable FORGE;

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

    // ── IBurnRedeemable: XEN calls this after burning ──
    function onTokenBurned(address, uint256) external {
        require(msg.sender == address(XEN_TOKEN), "not XEN");
    }

    // ── IERC165: XEN checks this before allowing burn ──
    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return interfaceId == type(IBurnRedeemable).interfaceId ||
               interfaceId == type(IERC165).interfaceId;
    }

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

        // Burn XEN directly from user's wallet
        // XEN checks allowance, burns from user, credits userBurns[user]
        // Then calls onTokenBurned() callback on this contract
        uint256 xen = b * XEN_BATCH;
        XEN.burn(msg.sender, xen);

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
