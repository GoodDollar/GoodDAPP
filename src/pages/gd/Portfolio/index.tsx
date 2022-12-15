import React, { memo, useCallback, useState } from 'react'
import { DAO_NETWORK, getMyList, LIQUIDITY_PROTOCOL, MyStake, useEnvWeb3 } from '@gooddollar/web3sdk'
import { SupportedChains } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { QuestionHelper } from 'components'
import AppNotice from 'components/AppNotice'
import ClaimRewards from 'components/ClaimRewards'
import { ButtonAction, ButtonDefault } from 'components/gd/Button'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import Card from 'components/gd/Card'
import Placeholder from 'components/gd/Placeholder'
import { Layout } from 'components/gd/sushi'
import AsyncTokenIcon from 'components/gd/sushi/AsyncTokenIcon'
import Table from 'components/gd/Table'
import Title from 'components/gd/Title'
import PortfolioTableRow from 'components/PortfolioTableRow'
import Web3SupportedNetworks from 'components/Web3SupportedNetworks'
import Withdraw from 'components/Withdraw'
import WithdrawRewards from 'components/WithdrawRewards'
import { disableTestnetMain } from 'constants/index'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useCallbackOnFocus from 'hooks/useCallbackOnFocus'
import usePromise from 'hooks/usePromise'
import { useWindowSize } from 'hooks/useWindowSize'
import styled from 'styled-components'
import { SavingsAccount } from './SavingsAccount'
import { CellSC, PortfolioAnalyticSC, PortfolioSC, PortfolioTitleSC, PortfolioValueSC } from './styled'

const MobileTableSC = styled.div``

const MobileCell = ({
    onUpdate,
    stake,
    protocol,
    stakeAmount,
    G$rewards,
    multiplier,
    rewardsGOOD,
}: {
    stake: MyStake
    onUpdate: () => void
    [prop: string]: any
}) => {
    const { i18n } = useLingui()
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)
    const [isClaimRewardsOpen, setClaimRewardsOpen] = useState(false)
    const { chainId } = useActiveWeb3React()

    const requireNetwork = stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? DAO_NETWORK.FUSE : DAO_NETWORK.MAINNET
    const claimableStake =
        (chainId === (SupportedChains.FUSE as number) && requireNetwork === DAO_NETWORK.FUSE) ||
        (chainId !== (SupportedChains.FUSE as number) && requireNetwork === DAO_NETWORK.MAINNET)

    const handleWithdrawOpen = useCallback(() => setWithdrawOpen(true), [])
    const handleClaimRewardsOpen = useCallback(() => setClaimRewardsOpen(true), [])

    return (
        <Card className="mb-6 md:mb-4 card">
            <CellSC>
                <Withdraw
                    open={isWithdrawOpen}
                    setOpen={setWithdrawOpen}
                    token={`${stake.tokens.A.symbol}`}
                    protocol={stake.protocol}
                    onWithdraw={onUpdate}
                    stake={stake}
                />
                <ClaimRewards
                    open={isClaimRewardsOpen}
                    setOpen={setClaimRewardsOpen}
                    protocol={stake.protocol}
                    onClaim={onUpdate}
                    stake={stake}
                />
                <div className="flex items-center font-bold token flex-nowrap">
                    <AsyncTokenIcon
                        address={stake.tokens.A.address}
                        chainId={stake.tokens.A.chainId as number}
                        className="block w-5 h-5 mr-2 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                        network={stake.protocol}
                    />
                    {stake.tokens.A.symbol}
                    {stake.tokens.A.address !== stake.tokens.B.address ?? `/ ${stake.tokens.B.symbol}`}
                </div>
                <div className="part protocol">
                    <Title type="category" className="flex items-center key">
                        {protocol?.title.toLowerCase()} <QuestionHelper text={protocol?.questionText || ''} />
                    </Title>
                    <div className="value">{stake.protocol}</div>
                </div>
                <div className="part multiplier">
                    <Title type="category" className="flex items-center key">
                        {multiplier?.title.toLowerCase()} <QuestionHelper text={multiplier?.questionText || ''} />
                    </Title>
                    {stake.protocol !== LIQUIDITY_PROTOCOL.GOODDAO ? (
                        <div className="whitespace-nowrap value">
                            {stake.multiplier ? (
                                <>{i18n._(t`This month`)} 2.0X</>
                            ) : (
                                <>
                                    {i18n._(t`This month`)} 1.0X
                                    <br />
                                    {i18n._(t`Next month:`)} 2.0X
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-left value"> - </div>
                    )}
                </div>
                <div className="part grewards">
                    <Title type="category" className="flex items-center key">
                        {G$rewards?.title.toLowerCase()} <QuestionHelper text={G$rewards?.questionText || ''} />
                    </Title>
                    {stake.protocol !== LIQUIDITY_PROTOCOL.GOODDAO ? (
                        <div className="whitespace-nowrap value">
                            {stake.rewards.reward &&
                                stake.rewards.reward.claimed
                                    .add(stake.rewards.reward.unclaimed)
                                    .toSignificant(6, { groupSeparator: ',' })}{' '}
                            {stake.rewards.reward && stake.rewards.reward.claimed.currency.symbol} <br />~
                            {stake.rewards.reward$ &&
                                stake.rewards.reward$.claimed
                                    .add(stake.rewards.reward$.unclaimed)
                                    .toFixed(2, { groupSeparator: ',' })}
                            $
                        </div>
                    ) : (
                        <div className="text-left value"> - </div>
                    )}
                </div>
                <div className="part goodrewards">
                    <Title type="category" className="flex items-center key">
                        {rewardsGOOD?.title.toLowerCase()} <QuestionHelper text={rewardsGOOD?.questionText || ''} />
                    </Title>
                    <div className="value">
                        {stake.rewards.GDAO.claimed
                            .add(stake.rewards.GDAO.unclaimed)
                            .toSignificant(6, { groupSeparator: ',' })}
                        {stake.rewards.GDAO.claimed.currency.symbol}
                    </div>
                </div>
                <div className="part stake">
                    <Title type="category" className="flex items-center key">
                        {stakeAmount?.title.toLowerCase()} <QuestionHelper text={stakeAmount?.questionText || ''} />
                    </Title>
                    <span className="whitespace-nowrap value">
                        {stake.stake.amount.toSignificant(6, { groupSeparator: ',' })}{' '}
                        {stake.stake.amount.currency.symbol}~{stake.stake.amount$.toFixed(2, { groupSeparator: ',' })}$
                    </span>
                </div>
                <div className="part withdraw">
                    <ActionOrSwitchButton
                        size="sm"
                        width="100%"
                        borderRadius="6px"
                        noShadow={true}
                        requireChain={stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? 'FUSE' : 'MAINNET'}
                        onClick={handleWithdrawOpen}
                        ButtonEl={ButtonAction}
                    >
                        {i18n._(t`Withdraw`)}
                    </ActionOrSwitchButton>
                    {claimableStake && (
                        <ButtonAction size="sm" noShadow={true} borderRadius="6px" onClick={handleClaimRewardsOpen}>
                            {i18n._(t`Claim rewards`)}
                        </ButtonAction>
                    )}
                </div>
            </CellSC>
        </Card>
    )
}

const MobileTable = ({ stakes, cells, onUpdate }: { stakes?: MyStake[]; cells: any; onUpdate: () => void }) => {
    const [protocol, stakeAmount, G$rewards, multiplier, rewardsGOOD] = cells

    const getCells = stakes?.map((stake) => (
        <MobileCell
            onUpdate={onUpdate}
            protocol={protocol}
            stakeAmount={stakeAmount}
            G$rewards={G$rewards}
            rewardsGOOD={rewardsGOOD}
            multiplier={multiplier}
            stake={stake}
            key={stake.address}
        />
    ))

    return <MobileTableSC>{getCells}</MobileTableSC>
}

const Portfolio = memo(() => {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()

    const [mainnetWeb3, mainnetChainId] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const [fuseWeb3, fuseChainId] = useEnvWeb3(DAO_NETWORK.FUSE)
    const { width } = useWindowSize()

    const isMobile = width ? width <= 768 : undefined

    const headings = [
        {
            title: i18n._(t`TYPE`),
            questionText: i18n._(
                t`Staking could be of two types: UBI for funds staked on the GoodDollar trust for the generation of new G$ for universal income distribution, or Governance (to be enabled) for staking G$s for GOOD Rewards.`
            ),
        },
        {
            title: i18n._(t`TOKEN`),
            questionText: i18n._(t`This is the token that is currently being staked.`),
        },
        {
            title: i18n._(t`PROTOCOL`),
            questionText: i18n._(t`This is the protocol that the token is staked to.`),
        },
        {
            title: i18n._(t`STAKE`),
            questionText: i18n._(t`Total amount on value staked.`),
        },
        {
            title: `G$ ${i18n._(t`REWARDS`)}`,
            questionText: i18n._(t`How much value your stake has accumulated so far.`),
        },
        {
            title: i18n._(t`MULTIPLIER`),
            questionText: i18n._(
                t`Starting at 1.0, your multiplier will increase to 2.0 after one month of staking to the Trust, at which point you can be rewarded with more G$ every day!`
            ),
        },
        {
            title: `GOOD ${i18n._(t`REWARDS`)}`,
            questionText: i18n._(t`How many GOOD tokens you are accumulating by this stake position.`),
        },
    ]

    const [data, , , update] = usePromise(async () => {
        const list =
            account && mainnetWeb3 && fuseWeb3 && !disableTestnetMain.includes(chainId)
                ? await getMyList(mainnetWeb3, fuseWeb3, account)
                : []
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
                              rewardsGDAOUnclaimed: stake.rewards.GDAO.unclaimed,
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
                              rewardsGDAOUnclaimed: acc.rewardsGDAOUnclaimed.add(stake.rewards.GDAO.unclaimed),
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
            ),
        }
    }, [account, mainnetChainId, fuseChainId])

    const showNotice = data?.list.find((stake) => stake.isDeprecated)

    useCallbackOnFocus(update)

    const portfolio = (
        <>
            <Card className="sm:mb-6 md:mb-4 card">
                <PortfolioAnalyticSC className="flex">
                    <div className="flex flex-col segment">
                        <Title type="category">{i18n._(t`My Stake`)}</Title>
                        <PortfolioValueSC>
                            ~{data?.aggregated?.myStake.toFixed(2, { groupSeparator: ',' }) ?? '0.00'}$
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col segment">
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
                    <div className="flex flex-col segment">
                        <Title type="category">GOOD {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAO.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAO.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex flex-col items-start justify-between segment lg:items-center social-contribution-wrapper">
                        <Title className="w-full text-center md:text-left" type="category">
                            {i18n._(t`Your social contribution from:`)}
                        </Title>
                        <div className="flex justify-center flex-grow social-contribution md:justify-start">
                            <div className="flex flex-col items-center mr-8 cell">
                                <PortfolioValueSC>–</PortfolioValueSC>
                                <Title type="category">{i18n._(t`Staking`)}</Title>
                            </div>
                            <div className="flex flex-col items-center ml-8 cell">
                                <PortfolioValueSC>–</PortfolioValueSC>
                                <Title type="category">{i18n._(t`Holding`)}</Title>
                            </div>
                        </div>
                    </div>
                </PortfolioAnalyticSC>
            </Card>
            <Card className="mb-6 md:mb-4 card">
                <PortfolioAnalyticSC style={{ height: 'auto' }} className="flex">
                    <div className="flex flex-col justify-center segment ">
                        <PortfolioTitleSC className="claimable-rewards">
                            {i18n._(t`Claimable`)} <br /> {i18n._(t`rewards`)}
                        </PortfolioTitleSC>
                    </div>
                    <div className="flex flex-col segment">
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
                    <div className="flex flex-col segment">
                        <Title type="category">GOOD {i18n._(t`Rewards`)}</Title>
                        <PortfolioValueSC>
                            {data?.aggregated?.rewardsGDAOUnclaimed.toSignificant(6, { groupSeparator: ',' }) ?? '0.00'}{' '}
                            {data?.aggregated?.rewardsGDAOUnclaimed.currency.symbol}
                        </PortfolioValueSC>
                    </div>
                    <div className="flex items-end justify-center md:flex-col segment withdraw-buttons">
                        <div className="h-full withdraw-button md:h-auto">
                            <WithdrawRewards
                                onClaim={update}
                                type="G$"
                                trigger={
                                    <ActionOrSwitchButton
                                        width="156px"
                                        size="default"
                                        noShadow={isMobile}
                                        requireChain={'MAINNET'}
                                        ButtonEl={ButtonDefault}
                                        className="actionButton"
                                    >
                                        {i18n._(t`Claim G$ rewards`)}
                                    </ActionOrSwitchButton>
                                }
                                // trigger={<ButtonDefault width={'156px'}>{i18n._(t`Claim rewards`)}</ButtonDefault>}
                            />
                        </div>
                        <div className="h-full withdraw-button md:h-auto">
                            <WithdrawRewards
                                onClaim={update}
                                type="GOOD"
                                trigger={
                                    <ButtonDefault size="default" className="md:mt-1 actionButton" width={'156px'}>
                                        {i18n._(t`Claim GOOD rewards`)}
                                    </ButtonDefault>
                                }
                                // trigger={<ButtonDefault width={'156px'}>{i18n._(t`Claim rewards`)}</ButtonDefault>}
                            />
                        </div>
                    </div>
                </PortfolioAnalyticSC>
            </Card>
            <PortfolioTitleSC className="mb-3 md:pl-2">{i18n._(`Stake Positions`)}</PortfolioTitleSC>
            {isMobile ? (
                <>
                    {showNotice && (
                        <AppNotice
                            text={'Please withdraw your funds from all deprecated contracts and use our new'}
                            link={[
                                'https://goodswap.xyz/#/stakes',
                                'https://www.gooddollar.org/gooddollar-critical-system-upgrade-february-27-2022/',
                            ]}
                            show={true}
                        ></AppNotice>
                    )}
                    <MobileTable cells={headings} stakes={data?.list} onUpdate={update} />
                </>
            ) : (
                <Card className="card" contentWrapped={false} style={{ position: 'relative' }}>
                    {showNotice && (
                        <AppNotice
                            text={'Please withdraw your funds from all deprecated contracts and use our new'}
                            link={[
                                'https://goodswap.xyz/#/stakes',
                                'https://www.gooddollar.org/gooddollar-critical-system-upgrade-february-27-2022/',
                            ]}
                            show={true}
                        ></AppNotice>
                    )}
                    <Table
                        header={
                            <tr>
                                {headings.map((item, index) => (
                                    <th key={index}>
                                        <Title type="category" className="flex items-center">
                                            {item.title} <QuestionHelper text={item.questionText || ''} />
                                        </Title>
                                    </th>
                                ))}
                            </tr>
                        }
                    >
                        {data?.list.map((stake) => (
                            <PortfolioTableRow stake={stake} key={stake.address} onUpdate={update} />
                        ))}
                    </Table>
                </Card>
            )}
            <Web3SupportedNetworks onItem={({ chain }) => <SavingsAccount requiredChain={chain} account={account} />} />
        </>
    )

    return (
        <Layout classes="md:mt-24 xl:mt-0 sh:mt-30">
            <PortfolioSC>
                <Title className="mb-6 md:pl-4">Portfolio</Title>
                {account ? (
                    portfolio
                ) : (
                    <Placeholder className="mx-4">{i18n._(t`Connect a wallet to see your portfolio`)}</Placeholder>
                )}
            </PortfolioSC>
        </Layout>
    )
})

export default Portfolio
