// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IGOLDToken {
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IDBXen {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function claimFees() external;
    function currentCycle() external view returns (uint256);
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
}

contract DXNForge is Ownable, ReentrancyGuard, ERC721 {
    using SafeERC20 for IERC20;

    uint256 private constant ACC = 1e18;
    address private constant DEAD = 0x000000000000000000000000000000000000dEaD;

    uint256 public constant FEE_GOLD = 8800;
    uint256 public constant FEE_BURN = 888;
    uint256 public constant FEE_LTS = 312;
    uint256 private constant FEE_BASE = 10000;
    uint256 private constant COOLDOWN = 24 hours;

    uint256 public constant TIX_DEC = 1e18;

    uint256 public constant WINDOW_LEN = 99;
    uint256[5] public TIER_DAYS = [1000, 2000, 3000, 4000, 5000];
    uint256[5] public TIER_WT = [1, 2, 3, 4, 5];
    uint256 public constant TOT_WT = 15;
    uint256 public constant CLAIM_WIN = 1000;

    IERC20 public DXN;
    IGOLDToken public GOLD;
    IDBXen public DBXEN;
    ISwapRouter public ROUTER;
    address public WETH;
    address public xenBurner;

    bool public bonusOn = true;
    uint256 public epoch = 1;
    uint256 public startCycle;
    uint256 public pendingBurn;
    uint256 public pendingLts;
    uint256 public allocLts;
    uint256[5] public ltsBucket;

    mapping(uint256 => uint256) public epAcc;
    mapping(uint256 => uint256) public epTix;
    mapping(uint256 => uint256) public epGold;
    mapping(uint256 => bool) public epDone;

    uint256 public lastFeeTime;
    uint256 public lastFeeCycle;

    struct UserDXN {
        uint256 pending;
        uint256 staked;
        uint256 unlock;
    }
    mapping(address => UserDXN) public userDXN;
    uint256 public dxnPending;
    uint256 public dxnStaked;

    uint256 public accTix;
    uint256 public tixEpoch;
    uint256 public stakerTixEpoch;
    mapping(address => uint256) public userTix;
    mapping(address => uint256) public userTixDebt;
    mapping(address => uint256) public userTixEp;

    mapping(address => uint256) public autoGold;
    uint256 public totAutoGold;

    struct ManualGold {
        uint256 pending;
        uint256 staked;
        uint256 earnCy;
        uint256 unlockCy;
        bool counted;
    }
    mapping(address => ManualGold) public manualGold;
    uint256 public manualPending;
    uint256 public manualStaked;

    uint256 public accEth;
    mapping(address => uint256) public ethDebt;
    uint256 public totEthDist;

    uint256 public crucible = 1;

    struct Crucible {
        uint256 start;
        uint256 end;
        uint256 lock;
        uint256[5] dxn;
        uint256[5] gold;
    }
    mapping(uint256 => Crucible) public crucibles;

    struct Snap {
        uint256 dxnAlloc;
        uint256 goldAlloc;
        uint256 dxnClaimed;
        uint256 goldClaimed;
        uint256 rolled;
        bool taken;
    }
    mapping(uint256 => mapping(uint8 => Snap)) public snaps;

    struct Pending {
        uint256[5] dxn;
        uint256[5] gold;
        bool minted;
    }
    mapping(address => mapping(uint256 => Pending)) public pending;

    struct Position {
        uint256 cru;
        address asset;
        uint8 tier;
        uint256 amt;
        uint256 lock;
        bool claimed;
    }
    mapping(uint256 => Position) public pos;
    uint256 public nextId = 1;

    mapping(address => mapping(uint256 => uint256)) public ltsLockedDXN;
    mapping(address => mapping(uint256 => uint256)) public ltsLockedGold;
    mapping(address => uint256) public userLtsDXN;
    mapping(address => uint256) public userLtsGold;

    uint256 public globalLtsDXN;
    uint256 public globalLtsGold;

    event Staked(address indexed u, uint256 amt);
    event Unstaked(address indexed u, uint256 amt);
    event Fees(uint256 total, uint256 gold, uint256 burn, uint256 lts);
    event Tix(uint256 wt, uint256 acc, uint256 add);
    event GoldAlloc(address indexed u, uint256 amt, uint256 ep);
    event Rewards(address indexed u, uint256 gold, uint256 eth);
    event GoldStaked(address indexed u, uint256 amt);
    event GoldUnstaked(address indexed u, uint256 amt);
    event EthClaimed(address indexed u, uint256 amt);
    event BuyBurn(uint256 indexed ep, uint256 eth, uint256 dxn, uint256 gold);
    event TicketsAdded(address indexed u, uint256 tix);
    event CruStart(uint256 indexed id, uint256 start, uint256 end, uint256 lock);
    event CruDeposit(address indexed u, uint256 indexed id, address asset, uint8 tier, uint256 amt);
    event CruMint(address indexed u, uint256 indexed id, uint256 tokenId, address asset, uint8 tier, uint256 amt);
    event CruClaim(address indexed u, uint256 indexed id, uint256 tokenId, address asset, uint256 amt, uint256 eth);
    event SnapTaken(uint256 indexed id, uint8 tier, uint256 dxn, uint256 gold, uint256 roll);

    error Zero();
    error InsuffBal();
    error Cooldown();
    error NoCycle();
    error Fail();
    error WindowClosed();
    error WindowOpen();
    error Minted();
    error NoMint();
    error NotMature();
    error Claimed();
    error BadTier();
    error NotOwner();
    error CantStart();
    error NoBurn();
    error NoTix();
    error NotBurner();

    constructor(
        address _dxn,
        address _gold,
        address _dbxen,
        address _router,
        address _weth,
        address _owner
    ) Ownable(_owner) ERC721("DXN Forge Crucible", "CRUCIBLE") {
        DXN = IERC20(_dxn);
        GOLD = IGOLDToken(_gold);
        DBXEN = IDBXen(_dbxen);
        ROUTER = ISwapRouter(_router);
        WETH = _weth;

        DXN.approve(_dbxen, type(uint256).max);
        DXN.approve(_router, type(uint256).max);

        startCycle = DBXEN.currentCycle();

        crucibles[1] = Crucible(1, 99, 100, [uint256(0),0,0,0,0], [uint256(0),0,0,0,0]);
        emit CruStart(1, 1, 99, 100);
    }

    // ── Owner functions ──
    function setBonus(bool _on) external onlyOwner { bonusOn = _on; }
    function setXenBurner(address _xb) external onlyOwner { xenBurner = _xb; }
    function advanceEpoch(uint256 n) external onlyOwner { epoch += n; }
    function injectBurn() external payable onlyOwner { pendingBurn += msg.value; }

    function injectLts() external payable onlyOwner {
        uint256 used = 0;
        for (uint8 i = 0; i < 4; i++) {
            uint256 share = (msg.value * TIER_WT[i]) / TOT_WT;
            ltsBucket[i] += share;
            used += share;
        }
        ltsBucket[4] += msg.value - used;
        pendingLts += msg.value;
    }

    function resetFeeTimer() external onlyOwner {
        lastFeeTime = 0;
        lastFeeCycle = 0;
    }

    // ── XenBurner callback: credit tickets + receive fee ETH ──
    function addTickets(address user, uint256 tix) external payable {
        if (msg.sender != xenBurner) revert NotBurner();
        _sync(user);
        userTix[user] += tix;
        tixEpoch += tix;
        emit TicketsAdded(user, tix);
    }

    // ── View functions ──

    function cycle() public view returns (uint256) { return DBXEN.currentCycle(); }

    function forgeCycle() public view returns (uint256) {
        return DBXEN.currentCycle() - startCycle + 1;
    }

    function totWt() public view returns (uint256) {
        return dxnPending + dxnStaked + globalLtsDXN;
    }

    function userWt(address u) public view returns (uint256) {
        return userDXN[u].pending + userDXN[u].staked + userLtsDXN[u];
    }

    function mult() public view returns (uint256) {
        if (!bonusOn || epoch > 25) return 1;
        return 10 - (((epoch - 1) * 9) / 24);
    }

    function pendTix(address u) public view returns (uint256) {
        if (userTixEp[u] < epoch) return 0;
        uint256 w = userWt(u);
        if (w == 0) return 0;
        uint256 owed = (w * accTix) / ACC;
        return owed > userTixDebt[u] ? owed - userTixDebt[u] : 0;
    }

    function userEligGold(address u) public view returns (uint256) {
        uint256 e = autoGold[u] + manualGold[u].staked + userLtsGold[u];
        if (manualGold[u].pending > 0 && cycle() >= manualGold[u].earnCy) {
            e += manualGold[u].pending;
        }
        return e;
    }

    function totEligGold() public view returns (uint256) {
        return totAutoGold + manualStaked + manualPending + globalLtsGold;
    }

    function pendEth(address u) public view returns (uint256) {
        uint256 e = userEligGold(u);
        if (e == 0) return 0;
        uint256 owed = (e * accEth) / ACC;
        return owed > ethDebt[u] ? owed - ethDebt[u] : 0;
    }

    function canFee() public view returns (bool) {
        return block.timestamp >= lastFeeTime + COOLDOWN && cycle() > lastFeeCycle;
    }

    function windowOpen(uint256 id) public view returns (bool) {
        Crucible storage c = crucibles[id];
        if (c.lock == 0) return false;
        uint256 cy = forgeCycle();
        return cy >= c.start && cy <= c.end;
    }

    function tierMature(uint256 id, uint8 t) public view returns (uint256) {
        return crucibles[id].lock + TIER_DAYS[t];
    }

    function isMature(uint256 id, uint8 t) public view returns (bool) {
        return forgeCycle() >= tierMature(id, t);
    }

    function deadline(uint256 id, uint8 t) public view returns (uint256) {
        if (t < 4) return crucibles[id].lock + TIER_DAYS[t + 1];
        Crucible storage next = crucibles[id + 1];
        if (next.lock == 0) return type(uint256).max;
        return next.lock + TIER_DAYS[0];
    }

    function nftMature(uint256 id) public view returns (bool) {
        Position storage p = pos[id];
        return p.amt > 0 && forgeCycle() >= p.lock + TIER_DAYS[p.tier];
    }

    function ethShare(uint256 id) public view returns (uint256) {
        Position storage p = pos[id];
        if (p.amt == 0 || p.claimed) return 0;

        Snap storage s = snaps[p.cru][p.tier];
        if (!s.taken) return 0;
        if (forgeCycle() >= deadline(p.cru, p.tier)) return 0;

        Crucible storage c = crucibles[p.cru];
        uint256 alloc = p.asset == address(DXN) ? s.dxnAlloc : s.goldAlloc;
        uint256 tot = p.asset == address(DXN) ? c.dxn[p.tier] : c.gold[p.tier];

        if (tot == 0) return 0;
        return (p.amt * alloc) / tot;
    }

    function canStartNew() public view returns (bool) {
        return forgeCycle() >= crucibles[crucible].lock + TIER_DAYS[4];
    }

    function getPending(address u, uint256 id) external view returns (uint256[5] memory d, uint256[5] memory g, bool m) {
        Pending storage p = pending[u][id];
        return (p.dxn, p.gold, p.minted);
    }

    function getTotals(uint256 id) external view returns (uint256[5] memory d, uint256[5] memory g) {
        Crucible storage c = crucibles[id];
        return (c.dxn, c.gold);
    }

    function getLtsBuckets() external view returns (uint256[5] memory) {
        return ltsBucket;
    }

    // ── Public sync ──
    function sync() external nonReentrant {
        _sync(msg.sender);
    }

    // ── DXN Staking ──
    function stakeDXN(uint256 amt) external nonReentrant {
        if (amt == 0) revert Zero();
        _sync(msg.sender);
        DXN.safeTransferFrom(msg.sender, address(this), amt);
        DBXEN.stake(amt);
        userDXN[msg.sender].pending += amt;
        userDXN[msg.sender].unlock = cycle() + 2;
        dxnPending += amt;
        _cpTix(msg.sender);
        emit Staked(msg.sender, amt);
    }

    function unstakeDXN(uint256 amt) external nonReentrant {
        if (amt == 0) revert Zero();
        _sync(msg.sender);
        if (userDXN[msg.sender].staked < amt) revert InsuffBal();
        userDXN[msg.sender].staked -= amt;
        dxnStaked -= amt;
        _cpTix(msg.sender);
        DBXEN.unstake(amt);
        DXN.safeTransfer(msg.sender, amt);
        emit Unstaked(msg.sender, amt);
    }

    // ── GOLD Staking ──
    function stakeGold(uint256 amt) external nonReentrant {
        if (amt == 0) revert Zero();
        _sync(msg.sender);
        if (!GOLD.transferFrom(msg.sender, address(this), amt)) revert Fail();
        ManualGold storage m = manualGold[msg.sender];
        m.pending += amt;
        m.earnCy = cycle() + 1;
        m.unlockCy = cycle() + 2;
        m.counted = false;
        _cpEth(msg.sender);
        emit GoldStaked(msg.sender, amt);
    }

    function unstakeGold(uint256 amt) external nonReentrant {
        if (amt == 0) revert Zero();
        _sync(msg.sender);
        if (manualGold[msg.sender].staked < amt) revert InsuffBal();
        manualGold[msg.sender].staked -= amt;
        manualStaked -= amt;
        _cpEth(msg.sender);
        if (!GOLD.transfer(msg.sender, amt)) revert Fail();
        emit GoldUnstaked(msg.sender, amt);
    }

    // ── Rewards ──
    function claimRewards() external nonReentrant {
        _sync(msg.sender);
        uint256 g = autoGold[msg.sender];
        uint256 e = pendEth(msg.sender);
        if (g == 0 && e == 0) revert Zero();

        _cpEth(msg.sender);

        if (e > 0) {
            (bool ok, ) = msg.sender.call{value: e}("");
            if (!ok) revert Fail();
        }
        if (g > 0) {
            autoGold[msg.sender] = 0;
            totAutoGold -= g;
            if (!GOLD.transfer(msg.sender, g)) revert Fail();
        }
        emit Rewards(msg.sender, g, e);
    }

    function claimEth() external nonReentrant {
        _sync(msg.sender);
        uint256 e = pendEth(msg.sender);
        if (e == 0) revert Zero();

        _cpEth(msg.sender);

        (bool ok, ) = msg.sender.call{value: e}("");
        if (!ok) revert Fail();
        emit EthClaimed(msg.sender, e);
    }

    // ── Protocol Fee Claiming ──
    function claimFees() external nonReentrant {
        _sync(msg.sender);

        if (block.timestamp < lastFeeTime + COOLDOWN) revert Cooldown();
        if (cycle() <= lastFeeCycle) revert NoCycle();

        DBXEN.claimFees();

        uint256 tot = address(this).balance - pendingBurn - pendingLts - allocLts;

        if (tot > 0) {
            uint256 toGold = (tot * FEE_GOLD) / FEE_BASE;
            uint256 toBurn = (tot * FEE_BURN) / FEE_BASE;
            uint256 toLts = tot - toGold - toBurn;

            uint256 elig = totEligGold();
            if (elig > 0) {
                accEth += (toGold * ACC) / elig;
                totEthDist += toGold;
            }

            pendingBurn += toBurn;

            {
                uint256 used = 0;
                for (uint8 i = 0; i < 4; i++) {
                    uint256 share = (toLts * TIER_WT[i]) / TOT_WT;
                    ltsBucket[i] += share;
                    used += share;
                }
                ltsBucket[4] += toLts - used;
            }
            pendingLts += toLts;

            emit Fees(tot, toGold, toBurn, toLts);
        }

        uint256 wt = totWt();
        if (wt > 0) {
            uint256 m = mult();
            accTix += (ACC * m * TIX_DEC) / wt;
            tixEpoch += m * TIX_DEC;
            stakerTixEpoch += m * TIX_DEC;
            emit Tix(wt, accTix, m);
        }

        // ── Auto-trigger snapshots for matured tiers ──
        {
            uint256 cy = forgeCycle();

            if (crucible > 1) {
                Crucible storage prev = crucibles[crucible - 1];
                if (prev.lock > 0) {
                    for (uint8 t = 0; t < 5; t++) {
                        if (!snaps[crucible - 1][t].taken && cy >= prev.lock + TIER_DAYS[t]) {
                            _snap(crucible - 1, t);
                        }
                    }
                }
            }

            Crucible storage cur = crucibles[crucible];
            if (cur.lock > 0) {
                for (uint8 t = 0; t < 5; t++) {
                    if (!snaps[crucible][t].taken && cy >= cur.lock + TIER_DAYS[t]) {
                        _snap(crucible, t);
                    }
                }
            }
        }

        lastFeeTime = block.timestamp;
        lastFeeCycle = cycle();
    }

    // ── Buy and Burn ──
    function buyAndBurn(uint256 amount, uint256 minOut) external nonReentrant {
        _sync(msg.sender);

        if (pendingBurn == 0) revert NoBurn();
        if (tixEpoch == 0) revert NoTix();

        uint256 eth = pendingBurn;
        uint256 toBurn = (amount == 0 || amount >= eth) ? eth : amount;
        pendingBurn = eth - toBurn;

        IWETH(WETH).deposit{value: toBurn}();
        IERC20(WETH).approve(address(ROUTER), toBurn);

        uint256 dxn = ROUTER.exactInputSingle(
            ISwapRouter.ExactInputSingleParams(WETH, address(DXN), 3000, address(this), toBurn, minOut, 0)
        );
        DXN.safeTransfer(DEAD, dxn);

        GOLD.mint(address(this), dxn);

        epAcc[epoch] = accTix;
        epTix[epoch] = tixEpoch;
        epGold[epoch] = dxn;
        epDone[epoch] = true;

        accTix = 0;
        tixEpoch = 0;
        stakerTixEpoch = 0;
        epoch++;

        emit BuyBurn(epoch - 1, toBurn, dxn, dxn);
    }

    // ── LTS: Add DXN to Crucible ──
    function addDXN(uint256 amt, uint8 t) external nonReentrant {
        if (t > 5) revert BadTier();
        if (!windowOpen(crucible)) revert WindowClosed();
        if (amt == 0) revert Zero();

        _sync(msg.sender);
        DXN.safeTransferFrom(msg.sender, address(this), amt);
        DBXEN.stake(amt);

        ltsLockedDXN[msg.sender][crucible] += amt;
        userLtsDXN[msg.sender] += amt;
        globalLtsDXN += amt;

        if (t == 5) {
            uint256 per = amt / 5;
            uint256 rem = amt % 5;
            for (uint8 i = 0; i < 5; i++) {
                uint256 a = per + (i == 4 ? rem : 0);
                if (a > 0) {
                    pending[msg.sender][crucible].dxn[i] += a;
                    crucibles[crucible].dxn[i] += a;
                    emit CruDeposit(msg.sender, crucible, address(DXN), i, a);
                }
            }
        } else {
            pending[msg.sender][crucible].dxn[t] += amt;
            crucibles[crucible].dxn[t] += amt;
            emit CruDeposit(msg.sender, crucible, address(DXN), t, amt);
        }

        _cpTix(msg.sender);
    }

    // ── LTS: Add GOLD to Crucible ──
    function addGOLD(uint256 amt, uint8 t) external nonReentrant {
        if (t > 5) revert BadTier();
        if (!windowOpen(crucible)) revert WindowClosed();
        if (amt == 0) revert Zero();

        _sync(msg.sender);
        if (!GOLD.transferFrom(msg.sender, address(this), amt)) revert Fail();

        ltsLockedGold[msg.sender][crucible] += amt;
        userLtsGold[msg.sender] += amt;
        globalLtsGold += amt;

        if (t == 5) {
            uint256 per = amt / 5;
            uint256 rem = amt % 5;
            for (uint8 i = 0; i < 5; i++) {
                uint256 a = per + (i == 4 ? rem : 0);
                if (a > 0) {
                    pending[msg.sender][crucible].gold[i] += a;
                    crucibles[crucible].gold[i] += a;
                    emit CruDeposit(msg.sender, crucible, address(GOLD), i, a);
                }
            }
        } else {
            pending[msg.sender][crucible].gold[t] += amt;
            crucibles[crucible].gold[t] += amt;
            emit CruDeposit(msg.sender, crucible, address(GOLD), t, amt);
        }

        _cpEth(msg.sender);
    }

    // ── LTS: Mint NFTs ──
    function mintNFTs(uint256 id) external nonReentrant {
        _sync(msg.sender);

        Crucible storage c = crucibles[id];
        if (c.lock == 0) revert WindowClosed();
        if (forgeCycle() <= c.end) revert WindowOpen();

        Pending storage p = pending[msg.sender][id];
        if (p.minted) revert Minted();

        bool has = false;

        for (uint8 i = 0; i < 5; i++) {
            if (p.dxn[i] > 0) {
                has = true;
                uint256 tid = nextId++;
                pos[tid] = Position(id, address(DXN), i, p.dxn[i], c.lock, false);
                _mint(msg.sender, tid);
                emit CruMint(msg.sender, id, tid, address(DXN), i, p.dxn[i]);
            }
            if (p.gold[i] > 0) {
                has = true;
                uint256 tid = nextId++;
                pos[tid] = Position(id, address(GOLD), i, p.gold[i], c.lock, false);
                _mint(msg.sender, tid);
                emit CruMint(msg.sender, id, tid, address(GOLD), i, p.gold[i]);
            }
        }

        if (!has) revert NoMint();
        p.minted = true;
    }

    // ── LTS: Claim NFT ──
    function claim(uint256 id) external nonReentrant {
        if (_ownerOf(id) != msg.sender) revert NotOwner();

        Position storage p = pos[id];
        if (p.claimed) revert Claimed();
        if (!nftMature(id)) revert NotMature();

        if (!snaps[p.cru][p.tier].taken) _snap(p.cru, p.tier);

        uint256 eth = ethShare(id);

        if (p.asset == address(DXN)) {
            snaps[p.cru][p.tier].dxnClaimed += eth;
        } else {
            snaps[p.cru][p.tier].goldClaimed += eth;
        }

        if (eth > 0) {
            allocLts -= eth;
            (bool ok, ) = msg.sender.call{value: eth}("");
            if (!ok) revert Fail();
        }

        uint256 amt = p.amt;
        if (p.asset == address(DXN)) {
            ltsLockedDXN[msg.sender][p.cru] -= amt;
            userLtsDXN[msg.sender] -= amt;
            globalLtsDXN -= amt;
            DBXEN.unstake(amt);
            DXN.safeTransfer(msg.sender, amt);
        } else {
            ltsLockedGold[msg.sender][p.cru] -= amt;
            userLtsGold[msg.sender] -= amt;
            globalLtsGold -= amt;
            if (!GOLD.transfer(msg.sender, amt)) revert Fail();
        }

        p.claimed = true;
        _burn(id);

        emit CruClaim(msg.sender, p.cru, id, p.asset, amt, eth);
    }

    // ── LTS: Start New Crucible ──
    function startNew() external {
        if (!canStartNew()) revert CantStart();

        uint256 old = crucible;
        if (!snaps[old][4].taken) _snap(old, 4);

        crucible++;
        uint256 newId = crucible;

        uint256 newStart = crucibles[old].lock + TIER_DAYS[4] + 1;
        uint256 newEnd = newStart + WINDOW_LEN - 1;
        uint256 newLock = newEnd + 1;

        crucibles[newId] = Crucible(newStart, newEnd, newLock, [uint256(0),0,0,0,0], [uint256(0),0,0,0,0]);
        emit CruStart(newId, newStart, newEnd, newLock);
    }

    // ── Internal: DXN pending → staked transition ──
    function _transDXN(address u) internal {
        UserDXN storage d = userDXN[u];
        if (d.pending > 0 && cycle() >= d.unlock) {
            dxnPending -= d.pending;
            dxnStaked += d.pending;
            d.staked += d.pending;
            d.pending = 0;
        }
    }

    // ── Internal: Settle tickets + allocate GOLD ──
    function _matTix(address u) internal {
        if (userTixEp[u] != 0 && userTixEp[u] < epoch) {
            _allocGold(u);
        }
        uint256 p = pendTix(u);
        if (p > 0) userTix[u] += p;
        userTixDebt[u] = (userWt(u) * accTix) / ACC;
        userTixEp[u] = epoch;
    }

    function _allocGold(address u) internal {
        uint256 ep = userTixEp[u];
        if (ep == 0 || ep >= epoch || !epDone[ep]) return;

        uint256 tix = userTix[u];
        uint256 w = userWt(u);
        if (w > 0 && epAcc[ep] > 0) {
            uint256 owed = (w * epAcc[ep]) / ACC;
            if (owed > userTixDebt[u]) tix += owed - userTixDebt[u];
        }
        if (tix > 0 && epTix[ep] > 0) {
            uint256 g = (tix * epGold[ep]) / epTix[ep];
            if (g > 0) {
                autoGold[u] += g;
                totAutoGold += g;
                _cpEth(u);
                emit GoldAlloc(u, g, ep);
            }
        }
        userTix[u] = 0;
        userTixDebt[u] = 0;
        userTixEp[u] = epoch;
    }

    function _cpTix(address u) internal {
        userTixDebt[u] = (userWt(u) * accTix) / ACC;
        userTixEp[u] = epoch;
    }

    // ── Internal: Manual GOLD pending → staked transition ──
    function _transGold(address u) internal {
        ManualGold storage m = manualGold[u];
        uint256 cy = cycle();
        if (m.pending > 0) {
            if (cy >= m.earnCy && !m.counted) {
                manualPending += m.pending;
                m.counted = true;
            }
            if (cy >= m.unlockCy) {
                manualPending -= m.pending;
                manualStaked += m.pending;
                m.staked += m.pending;
                m.pending = 0;
                m.counted = false;
            }
        }
    }

    function _cpEth(address u) internal {
        ethDebt[u] = (userEligGold(u) * accEth) / ACC;
    }

    function _sync(address u) internal {
        _transDXN(u);
        _matTix(u);
        _transGold(u);
    }

    // ── Internal: LTS Snapshot with weighted redistribution ──
    function _snap(uint256 id, uint8 t) internal {
        Snap storage s = snaps[id][t];

        uint256 roll = 0;
        if (t > 0) {
            Snap storage prev = snaps[id][t - 1];
            if (prev.taken) {
                roll = (prev.dxnAlloc - prev.dxnClaimed) + (prev.goldAlloc - prev.goldClaimed);
            }
        } else if (id > 1) {
            Snap storage prev5 = snaps[id - 1][4];
            if (prev5.taken) {
                roll = (prev5.dxnAlloc - prev5.dxnClaimed) + (prev5.goldAlloc - prev5.goldClaimed);
            }
        }

        if (roll > 0) {
            allocLts -= roll;

            uint256 remainWt = 0;
            for (uint8 i = t; i < 5; i++) {
                remainWt += TIER_WT[i];
            }
            if (remainWt > 0) {
                uint256 used = 0;
                for (uint8 i = t; i < 4; i++) {
                    uint256 share = (roll * TIER_WT[i]) / remainWt;
                    ltsBucket[i] += share;
                    used += share;
                }
                ltsBucket[4] += roll - used;
            }
        }

        uint256 tierPool = ltsBucket[t];
        uint256 dPool = tierPool / 2;
        uint256 gPool = tierPool - dPool;

        s.dxnAlloc = dPool;
        s.goldAlloc = gPool;
        s.rolled = roll;
        s.taken = true;

        pendingLts -= tierPool;
        ltsBucket[t] = 0;
        allocLts += tierPool;

        emit SnapTaken(id, t, s.dxnAlloc, s.goldAlloc, roll);
    }

    // ── ERC721 transfer override: migrate LTS weight between users ──
    function _update(address to, uint256 id, address auth) internal override returns (address from) {
        from = super._update(to, id, auth);

        if (from != address(0) && to != address(0)) {
            Position storage p = pos[id];
            if (!p.claimed && p.amt > 0) {
                _sync(from);
                _sync(to);

                if (p.asset == address(DXN)) {
                    ltsLockedDXN[from][p.cru] -= p.amt;
                    ltsLockedDXN[to][p.cru] += p.amt;
                    userLtsDXN[from] -= p.amt;
                    userLtsDXN[to] += p.amt;
                    _cpTix(from);
                    _cpTix(to);
                } else {
                    ltsLockedGold[from][p.cru] -= p.amt;
                    ltsLockedGold[to][p.cru] += p.amt;
                    userLtsGold[from] -= p.amt;
                    userLtsGold[to] += p.amt;
                    _cpEth(from);
                    _cpEth(to);
                }
            }
        }
        return from;
    }

    receive() external payable {}
}
