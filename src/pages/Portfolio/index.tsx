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
import { portfolioSupportedAt, SupportedChainId } from '../../sdk/constants/chains'
import Placeholder from '../../components/gd/Placeholder'
import { QuestionHelper } from '../../components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const Portfolio = () => {
    const { i18n } = useLingui()
    const web3 = useWeb3()
    const { chainId, account } = useActiveWeb3React()
    const [data, , , update] = usePromise(async () => {
        const list = web3 && account && portfolioSupportedAt.includes(chainId) ? await getMyList(web3) : []

        return {
            list,
            aggregated: list.reduce(
                (acc, stake) => {
                    return !acc
                        ? {
                              myStake: stake.stake.amount$,
                              rewardsG$: stake.rewards.reward.claimed.add(stake.rewards.reward.unclaimed),
                              rewardsG$$: stake.rewards.reward$.claimed.add(stake.rewards.reward$.unclaimed),
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
                              rewardsG$$: acc.rewardsG$$
                                  .add(stake.rewards.reward$.claimed)
                                  .add(stake.rewards.reward$.unclaimed),
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
                          rewardsG$$: CurrencyAmount<Currency>
                          rewardsG$Unclaimed: CurrencyAmount<Currency>
                          rewardsG$Unclaimed$: CurrencyAmount<Currency>
                          rewardsGDAO: CurrencyAmount<Currency>
                          rewardsGDAOUnclaimed: CurrencyAmount<Currency>
                      }
            )
        }
    }, [chainId, account])

    const portfolio = (
        <>
            <Card className="mb-4">
                <PortfolioAnalyticSC className="flex">
                    <div className="flex flex-col">
                        <Title type="category">{i18n._(t`My Stake`)}</Title>
                        <PortfolioValueSC>
                            ~{data?.aggregated?.myStake.toFixed(2, { groupSeparator: ',' }) ?? '0.00'}$
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col">
                        <Title type="category">G$ {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsG$.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsG$.currency.symbol}
                            <br />
                            <small>
                                ~{data?.aggregated?.rewardsG$$.toFixed(2, { groupSeparator: ',' }) ?? '0.00'}$
                            </small>
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col">
                        <Title type="category">GDAO {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAO.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAO.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col justify-between lg:items-center items-start">
                        <Title type="category">{i18n._(t`Your social contribution from:`)}</Title>
                        <div className="social-contribution flex flex-grow">
                            <div className="flex flex-col items-center mr-8">
                                <PortfolioValueSC>–</PortfolioValueSC>
                                <Title type="category">{i18n._(t`Staking`)}</Title>
                            </div>
                            <div className="flex flex-col items-center ml-8">
                                <PortfolioValueSC>–</PortfolioValueSC>
                                <Title type="category">{i18n._(t`Holding`)}</Title>
                            </div>
                        </div>
                    </div>
                </PortfolioAnalyticSC>
            </Card>
            <Card className="mb-4">
                <PortfolioAnalyticSC className="flex">
                    <div className="flex flex-col justify-center ">
                        <PortfolioTitleSC className="claimable-rewards">
                            {i18n._(t`Claimable`)} <br /> {i18n._(t`rewards`)}
                        </PortfolioTitleSC>
                    </div>
                    <div className="flex flex-col">
                        <Title type="category">G$ {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsG$Unclaimed.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsG$Unclaimed.currency.symbol}
                            <br />
                            <small>
                                ~{data?.aggregated?.rewardsG$Unclaimed$.toFixed(2, { groupSeparator: ',' }) ?? '0.00'}$
                            </small>
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col">
                        <Title type="category">GDAO {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAOUnclaimed.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAOUnclaimed.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col justify-center items-end">
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
                                <Title type={'category'} className="flex items-center">
                                    {i18n._(t`TOKEN`)}{' '}
                                    <QuestionHelper
                                        text={i18n._(t`This is the token that is currently being staked.`)}
                                    />
                                </Title>
                            </th>
                            <th>
                                <Title type={'category'} className="flex items-center">
                                    {i18n._(t`PROTOCOL`)}{' '}
                                    <QuestionHelper
                                        text={i18n._(t`This is the protocol that the token is staked to.`)}
                                    />
                                </Title>
                            </th>
                            <th>
                                <Title type={'category'}>{i18n._(t`STAKE`)}</Title>
                            </th>
                            <th>
                                <Title type={'category'}>G$ {i18n._(t`REWARDS`)}</Title>
                            </th>
                            <th>
                                <Title type={'category'}>{i18n._(t`MULTIPLIER`)}</Title>
                            </th>
                            <th>
                                <Title type={'category'}>GDAO {i18n._(t`REWARDS`)}</Title>
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
        </>
    )

    return (
        <Layout>
            <PortfolioSC>
                <Title className="mb-6 pl-4">Portfolio</Title>
                {account && portfolioSupportedAt.includes(chainId) ? (
                    portfolio
                ) : (
                    <Placeholder className="mx-4">
                        {!portfolioSupportedAt.includes(chainId)
                            ? i18n._(
                                  t`Switch your network to ${
                                      SupportedChainId[portfolioSupportedAt[0] as any]
                                  } to work with Portfolio`
                              )
                            : i18n._(t`Connect to a wallet`)}
                    </Placeholder>
                )}
            </PortfolioSC>
        </Layout>
    )
}

export default memo(Portfolio)
