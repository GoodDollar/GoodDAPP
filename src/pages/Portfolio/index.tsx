import React, { memo, useCallback, useState } from 'react'
import { Layout } from '../../kashi'
import { PortfolioAnalyticSC, PortfolioSC, PortfolioTitleSC, PortfolioValueSC } from './styled'
import Title from '../../components/gd/Title'
import Card from '../../components/gd/Card'
import { ButtonDefault } from '../../components/gd/Button'
import Table from '../../components/gd/Table'
import WithdrawRewards from 'components/WithdrawRewards'
import PortfolioTableRow from 'components/PortfolioTableRow'
import usePromise from '../../hooks/usePromise'
import { getMyList } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'

const Portfolio = () => {
    const web3 = useWeb3()
    const { chainId } = useActiveWeb3React()
    const [dep, _update] = useState({})
    const update = useCallback(() => _update({}), [])
    const [data] = usePromise(async () => {
        const list = web3 ? await getMyList(web3) : []

        return {
            list,
            aggregated: list.reduce(
                (acc, stake) => {
                    return !acc
                        ? {
                              myStake: stake.stake.amount$,
                              rewardsG$: stake.rewards.reward.claimed.add(stake.rewards.reward.unclaimed),
                              rewardsG$Unclaimed: stake.rewards.reward.unclaimed,
                              rewardsG$Unclaimed$: stake.rewards.reward$.unclaimed,
                              rewardsGDAO: stake.rewards.GDAO.claimed.add(stake.rewards.GDAO.unclaimed),
                              rewardsGDAOUnclaimed: stake.rewards.GDAO.unclaimed
                          }
                        : {
                              myStake: acc.myStake.add(stake.stake.amount$),
                              rewardsG$: acc.rewardsG$
                                  .add(stake.rewards.reward.claimed)
                                  .add(stake.rewards.reward.unclaimed),
                              rewardsG$Unclaimed: acc.rewardsG$Unclaimed.add(stake.rewards.reward.unclaimed),
                              rewardsG$Unclaimed$: acc.rewardsG$Unclaimed$.add(stake.rewards.reward$.unclaimed),
                              rewardsGDAO: acc.rewardsGDAO
                                  .add(stake.rewards.GDAO.claimed)
                                  .add(stake.rewards.GDAO.unclaimed),
                              rewardsGDAOUnclaimed: acc.rewardsGDAOUnclaimed.add(stake.rewards.GDAO.unclaimed)
                          }
                },
                undefined as
                    | undefined
                    | {
                          myStake: CurrencyAmount<Currency>
                          rewardsG$: CurrencyAmount<Currency>
                          rewardsG$Unclaimed: CurrencyAmount<Currency>
                          rewardsG$Unclaimed$: CurrencyAmount<Currency>
                          rewardsGDAO: CurrencyAmount<Currency>
                          rewardsGDAOUnclaimed: CurrencyAmount<Currency>
                      }
            )
        }
    }, [dep, chainId])

    return (
        <Layout>
            <PortfolioSC>
                <Title className="mb-6 pl-4">Portfolio</Title>
                <Card className="mb-4">
                    <PortfolioAnalyticSC className="flex">
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">My Stake</Title>
                            <PortfolioValueSC>~{data?.aggregated?.myStake.toFixed(2) ?? '0.00'}$</PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">
                                Total Rewards to Date <br /> (G$ & GDAO)
                            </Title>
                            <PortfolioValueSC>
                                -
                                {/*~{data?.aggregated?.rewardsG$.add(data.aggregated.rewardsGDAO).toSignificant(6)}{' '}*/}
                                {/*{data?.aggregated?.rewardsG$.currency.symbol}*/}
                            </PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">G$ Rewards</Title>
                            <PortfolioValueSC>
                                {data?.aggregated?.rewardsG$.toSignificant(6) ?? '0.00'}{' '}
                                {data?.aggregated?.rewardsG$.currency.symbol}
                            </PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">GDAO Rewards</Title>
                            <PortfolioValueSC>
                                {data?.aggregated?.rewardsGDAO.toSignificant(6) ?? '0.00'}{' '}
                                {data?.aggregated?.rewardsGDAO.currency.symbol}
                            </PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">Your social contribution from:</Title>
                        </div>
                    </PortfolioAnalyticSC>
                </Card>
                <Card className="mb-4">
                    <PortfolioAnalyticSC className="flex">
                        <div className="flex flex-col justify-center flex-grow">
                            <PortfolioTitleSC className="claimable-rewards">
                                Claimable <br /> rewards
                            </PortfolioTitleSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">G$ Rewards</Title>
                            <PortfolioValueSC>
                                {data?.aggregated?.rewardsG$Unclaimed.toSignificant(6) ?? '0.00'}{' '}
                                {data?.aggregated?.rewardsG$Unclaimed.currency.symbol} / ~
                                {data?.aggregated?.rewardsG$Unclaimed$.toFixed(2) ?? '0.00'}$
                            </PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-between flex-grow">
                            <Title type="category">GDAO Rewards</Title>
                            <PortfolioValueSC>
                                {data?.aggregated?.rewardsGDAOUnclaimed.toSignificant(6) ?? '0.00'}{' '}
                                {data?.aggregated?.rewardsGDAOUnclaimed.currency.symbol}
                            </PortfolioValueSC>
                        </div>
                        <div className="flex flex-col justify-center items-end flex-grow">
                            <WithdrawRewards
                                onClaim={update}
                                trigger={<ButtonDefault width={'156px'}>Withdraw rewards</ButtonDefault>}
                            />
                        </div>
                    </PortfolioAnalyticSC>
                </Card>
                <PortfolioTitleSC className="mb-3 pl-2">Ethereum</PortfolioTitleSC>
                <Card contentWrapped={false}>
                    <Table
                        header={
                            <tr>
                                <th>
                                    <Title type={'category'}>TYPE</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>TOKEN</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>PROTOCOL</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>STAKE</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>G$ REWARDS</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>MULTIPLIER</Title>
                                </th>
                                <th>
                                    <Title type={'category'}>GDAO REWARDS</Title>
                                </th>
                                <th></th>
                            </tr>
                        }
                    >
                        {data?.list.map(stake => (
                            <PortfolioTableRow stake={stake} key={stake.address} onWithdraw={update} />
                        ))}
                    </Table>
                </Card>
            </PortfolioSC>
        </Layout>
    )
}

export default memo(Portfolio)
