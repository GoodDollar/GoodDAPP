import { a9 as __read, an as DAO_NETWORK, ah as getNetworkEnv, S as SupportedChainId, d as __awaiter, e as __generator, ae as CurrencyAmount, ac as Fraction } from '../chunks/addresses.js';
import { useState, useMemo, useEffect } from 'react';
import { u as useEnvWeb3, d as getContract, G as GovernanceStaking, a as getReserveSocialAPY } from '../chunks/staking.js';
export { j as GdSDkContext, h as getRpc, u as useEnvWeb3, k as useGdContextProvider } from '../chunks/staking.js';
import { H as G$, G as GDAO } from '../chunks/apollo.js';
import { L as LIQUIDITY_PROTOCOL } from '../chunks/index.js';
import 'stream';
import 'http';
import 'https';
import 'os';
import 'crypto';

var useGovernanceStaking = function (activeWeb3, chainId) {
    var _a = __read(useEnvWeb3(DAO_NETWORK.MAINNET, activeWeb3, chainId), 2), mainnetWeb3 = _a[0], mainnetChainId = _a[1];
    var _b = __read(useEnvWeb3(DAO_NETWORK.FUSE, activeWeb3, chainId), 1), fuseWeb3 = _b[0];
    var _c = __read(useState([]), 2), stakes = _c[0], setStakes = _c[1];
    var networkType = getNetworkEnv();
    // console.log('useGovernanceStaking networkType -->', {networkType})
    var stakingContractV2 = useMemo(function () { return fuseWeb3 && networkType === 'production' && getContract(SupportedChainId.FUSE, 'GovernanceStakingV2', GovernanceStaking.abi, fuseWeb3); }, [fuseWeb3, networkType]);
    var stakingContractV1 = useMemo(function () { return fuseWeb3 && networkType !== 'production' && getContract(SupportedChainId.FUSE, 'GovernanceStaking', GovernanceStaking.abi, fuseWeb3); }, [fuseWeb3, networkType]);
    var stakingContract = stakingContractV2 || stakingContractV1;
    useEffect(function () {
        var readData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, goodRewardsPerYear, totalStaked, socialAPY, stakeData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(mainnetWeb3 && stakingContract)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all([
                                stakingContract.getRewardsPerBlock().then(function (_) { return _.mul(12 * 60 * 24 * 365); }),
                                stakingContract.totalSupply()
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), goodRewardsPerYear = _a[0], totalStaked = _a[1];
                        return [4 /*yield*/, getReserveSocialAPY(mainnetWeb3, mainnetChainId)];
                    case 2:
                        socialAPY = _b.sent();
                        stakeData = {
                            address: stakingContract.address,
                            socialAPY: socialAPY,
                            protocol: LIQUIDITY_PROTOCOL.GOODDAO,
                            rewards: {
                                G$: CurrencyAmount.fromRawAmount(G$[SupportedChainId.FUSE], 0),
                                GDAO: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.FUSE], goodRewardsPerYear)
                            },
                            liquidity: new Fraction(totalStaked, 100),
                            tokens: { A: G$[SupportedChainId.FUSE], B: G$[SupportedChainId.FUSE] }
                        };
                        setStakes([stakeData]);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        readData();
    }, [stakingContract, setStakes, mainnetWeb3, mainnetChainId]);
    // const [balance, setBalance] = useState<string>('0')
    return stakes;
    // const masterChefV2Contract = useMasterChefV2Contract()
    // const currentBlockNumber = useBlockNumber()
    // const fetchPending = useCallback(async () => {
    //     const rewarderAddress = await masterChefV2Contract?.rewarder('0')
    //     const rewarderContract = await getContract(
    //         rewarderAddress ? rewarderAddress : undefined,
    //         ALCX_REWARDER_ABI,
    //         library!,
    //         undefined
    //     )
    //     const pending = await rewarderContract?.pendingTokens(pid, account, '0')
    //     // todo: do not assume [0] or that rewardToken has 18 decimals
    //     const formatted = Fraction.from(BigNumber.from(pending?.rewardAmounts[0]), BigNumber.from(10).pow(18)).toString(
    //         18
    //     )
    //     //console.log('pending:', pending)
    //     setBalance(formatted)
    // }, [masterChefV2Contract, library, pid, account])
    // useEffect(() => {
    //     if (account && masterChefV2Contract && String(pid) && library) {
    //         // pid = 0 is evaluated as false
    //         fetchPending()
    //     }
    // }, [account, currentBlockNumber, fetchPending, masterChefV2Contract, pid, library])
    // return balance
};

export { useGovernanceStaking };
