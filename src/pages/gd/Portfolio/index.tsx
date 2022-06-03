import React, { memo, useCallback, useState } from 'react'
import { Layout } from 'components/gd/sushi'
import { PortfolioAnalyticSC, PortfolioSC, PortfolioTitleSC, PortfolioValueSC } from './styled'
import Title from 'components/gd/Title'
import Card from 'components/gd/Card'
import { ButtonDefault } from 'components/gd/Button'
import Table from 'components/gd/Table'
import WithdrawRewards from 'components/WithdrawRewards'
import PortfolioTableRow from 'components/PortfolioTableRow'
import usePromise from 'hooks/usePromise'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import Placeholder from 'components/gd/Placeholder'
import { QuestionHelper } from 'components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import useCallbackOnFocus from 'hooks/useCallbackOnFocus'
import AppNotice from 'components/AppNotice'


import { useEnvWeb3 } from '@gooddollarorg/sdk/dist/hooks'
import { getMyList} from '@gooddollarorg/sdk/dist/core/staking'
import { DAO_NETWORK, portfolioSupportedAt, SupportedChainId } from '@gooddollarorg/sdk/dist/constants'


const Portfolio = () => {
    const { i18n } = useLingui()
    const { chainId, account } = useActiveWeb3React()
    const [mainnetWeb3, mainnetChainId] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const [fuseWeb3, fuseChainId] = useEnvWeb3(DAO_NETWORK.FUSE)

    const [data, , , update] = usePromise(async () => {
        const list = account && mainnetWeb3 && fuseWeb3 ? await getMyList(mainnetWeb3, fuseWeb3, account) : []
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
    }, [account, mainnetChainId, fuseChainId])

    const showNotice = data?.list.find(stake => stake.isDeprecated)

    useCallbackOnFocus(update)

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
                        <Title type="category">GOOD {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAO.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAO.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col items-start justify-between lg:items-center">
                        <Title type="category">{i18n._(t`Your social contribution from:`)}</Title>
                        <div className="flex flex-grow social-contribution">
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
                <PortfolioAnalyticSC style={{ height: 'auto' }} className="flex">
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
                        <Title type="category">GOOD {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAOUnclaimed.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAOUnclaimed.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                        <div>
                            <WithdrawRewards
                                onClaim={update}
                                type="G$"
                                trigger={
                                    <ActionOrSwitchButton
                                        width="156px"
                                        // noShadow={true}
                                        requireNetwork={DAO_NETWORK.MAINNET}
                                        ButtonEl={ButtonDefault}
                                    >
                                        {i18n._(t`Claim G$ rewards`)}
                                    </ActionOrSwitchButton>
                                }
                                // trigger={<ButtonDefault width={'156px'}>{i18n._(t`Claim rewards`)}</ButtonDefault>}
                            />
                        </div>
                        <div>
                            <WithdrawRewards
                                onClaim={update}
                                type="GOOD"
                                trigger={
                                    <ButtonDefault className="mt-1" width={'156px'}>
                                        {i18n._(t`Claim GOOD rewards`)}
                                    </ButtonDefault>
                                }
                                // trigger={<ButtonDefault width={'156px'}>{i18n._(t`Claim rewards`)}</ButtonDefault>}
                            />
                        </div>
                    </div>
                </PortfolioAnalyticSC>
            </Card>
            <PortfolioTitleSC className="pl-2 mb-3">{i18n._(`Positions`)}</PortfolioTitleSC>
            <Card contentWrapped={false} style={{ position: 'relative' }}>
                {showNotice && (
                    <AppNotice
                        text={'Please withdraw your funds from all deprecated contracts and use our new'}
                        link={[
                            'https://goodswap.xyz/#/stakes',
                            'https://www.gooddollar.org/gooddollar-critical-system-upgrade-february-27-2022/'
                        ]}
                        show={true}
                    ></AppNotice>
                )}
                <Table
                    header={
                        <tr>
                            {[
                                {
                                    title: i18n._(t`TYPE`),
                                    questionText: i18n._(
                                        t`Staking could be of two types: UBI for funds staked on the GoodDollar trust for the generation of new G$ for universal income distribution, or Governance (to be enabled) for staking G$s for GOOD Rewards.`
                                    )
                                },
                                {
                                    title: i18n._(t`TOKEN`),
                                    questionText: i18n._(t`This is the token that is currently being staked.`)
                                },
                                {
                                    title: i18n._(t`PROTOCOL`),
                                    questionText: i18n._(t`This is the protocol that the token is staked to.`)
                                },
                                {
                                    title: i18n._(t`STAKE`),
                                    questionText: i18n._(t`Total amount on value staked.`)
                                },
                                {
                                    title: `G$ ${i18n._(t`REWARDS`)}`,
                                    questionText: i18n._(t`How much value your stake has accumulated so far.`)
                                },
                                {
                                    title: i18n._(t`MULTIPLIER`),
                                    questionText: i18n._(
                                        t`Starting at 1.0, your multiplier will increase to 2.0 after one month of staking to the Trust, at which point you can be rewarded with more G$ every day!`
                                    )
                                },
                                {
                                    title: `GOOD ${i18n._(t`REWARDS`)}`,
                                    questionText: i18n._(
                                        t`How many GOOD tokens you are accumulating by this stake position.`
                                    )
                                }
                            ].map((item, index) => (
                                <th key={index}>
                                    <Title type="category" className="flex items-center">
                                        {item.title} <QuestionHelper text={item.questionText || ''} />
                                    </Title>
                                </th>
                            ))}
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
        <Layout classes="md:mt-24 xl:mt-0 sh:mt-30">
            <PortfolioSC>
                <Title className="pl-4 mb-6">Portfolio</Title>
                {account ? (
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
