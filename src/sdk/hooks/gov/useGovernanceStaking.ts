import { useEffect, useState, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { getContract } from 'sdk/utils/getContract'
import GovernanceStaking from '@gooddollar/goodprotocol/artifacts/contracts/governance/GovernanceStaking.sol/GovernanceStaking.json'
import { DAO_NETWORK, SupportedChainId } from 'sdk/constants/chains'
import { getReserveRatio, Stake, getReserveSocialAPY } from 'sdk/staking'
import { G$, GDAO } from 'sdk/constants/tokens'
import { LIQUIDITY_PROTOCOL } from 'sdk/constants/protocols'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
// import { useEnvWeb3 } from '../useEnvWeb3'
import { useEnvWeb3 } from '../useNewEnvWeb3'
import { getNetworkEnv } from 'sdk/constants/addresses'
import { getChainId } from 'sdk/utils/web3'

type Stats = { [key: string]: BigNumber }
export const useGovernanceStaking = (activeWeb3?: any, chainId?: number): Array<Stake> => {
    const [mainnetWeb3, mainnetChainId] = useEnvWeb3(DAO_NETWORK.MAINNET, activeWeb3, chainId)
    const [fuseWeb3] = useEnvWeb3(DAO_NETWORK.FUSE, activeWeb3, chainId)
    const [stakes, setStakes] = useState<Array<Stake>>([])

    const networkType = getNetworkEnv()
    // console.log('useGovernanceStaking networkType -->', {networkType})

    const stakingContractV2 = useMemo(
      () => fuseWeb3 && networkType !== 'staging' && getContract(SupportedChainId.FUSE, 'GovernanceStakingV2', GovernanceStaking.abi, fuseWeb3),
      [fuseWeb3]
    )

    const stakingContractV1 = useMemo(
      () => fuseWeb3 && networkType === 'staging' && getContract(SupportedChainId.FUSE, 'GovernanceStaking', GovernanceStaking.abi, fuseWeb3),
      [fuseWeb3]
    )

    const stakingContract = stakingContractV2 || stakingContractV1

    useEffect(() => {
        const readData = async () => {
            if (mainnetWeb3 && stakingContract) {
                const [goodRewardsPerYear, totalStaked] = await Promise.all([
                  stakingContract.getRewardsPerBlock().then((_: BigNumber) => _.mul(12 * 60 * 24 * 365)),
                  stakingContract.totalSupply()
                ])

                const socialAPY = await getReserveSocialAPY(mainnetWeb3, mainnetChainId)

                const stakeData: Stake = {
                    address: stakingContract.address,
                    socialAPY: socialAPY,
                    protocol: LIQUIDITY_PROTOCOL.GOODDAO,
                    rewards: {
                        G$: CurrencyAmount.fromRawAmount(G$[SupportedChainId.FUSE] as any, 0),
                        GDAO: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.FUSE] as any, goodRewardsPerYear)
                    },
                    liquidity: new Fraction(totalStaked, 100),
                    tokens: { A: G$[SupportedChainId.FUSE], B: G$[SupportedChainId.FUSE] }
                }
                setStakes([stakeData])
            }
        }
        readData()
    }, [stakingContract, setStakes, mainnetWeb3])
    // const [balance, setBalance] = useState<string>('0')
    return stakes
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
}
