import { Layout, MarketHeader } from 'components/gd/sushi'
import { t } from '@lingui/macro'
import AsyncTokenIcon from 'components/gd/sushi/AsyncTokenIcon'
import ListHeaderWithSort from 'components/gd/sushi/ListHeaderWithSort'
import React, { Fragment, useState } from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import useSearchAndSort from 'hooks/useSearchAndSort'
import { useLingui } from '@lingui/react'
import Modal from 'components/Modal'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import { ButtonOutlined } from 'components/gd/Button'
import Table from 'components/gd/Table'
import { Wrapper, CellSC } from './styled'
import StakeDeposit from './StakeDeposit'
import usePromise from 'hooks/usePromise'
import { QuestionHelper } from 'components'
import useCallbackOnFocus from 'hooks/useCallbackOnFocus'
import { Savings } from './Savings'
import { disableTestnetMain } from 'constants/index'

import {
    LIQUIDITY_PROTOCOL,
    DAO_NETWORK,
    useEnvWeb3,
    getList as getStakes,
    Stake,
    useGdContextProvider,
    useGovernanceStaking,
} from '@gooddollar/web3sdk'

import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { useWindowSize } from 'hooks/useWindowSize'
import styled from 'styled-components'
import { SupportedChains } from '@gooddollar/web3sdk-v2'

const StakeTable = ({
    list,
    error,
    loading,
    hasAPY = true,
    rewardsSortKey = 'rewards.G$',
    network,
    setActiveStake,
    setActiveTableName,
}: {
    list: any
    error: Error | undefined
    loading: boolean
    hasAPY?: boolean
    rewardsSortKey?: string
    network: DAO_NETWORK
    setActiveStake: any
    setActiveTableName: () => any
}) => {
    const { i18n } = useLingui()

    const { width } = useWindowSize()

    const isMobile = width ? width <= 768 : undefined

    const sendData = useSendAnalyticsData()

    const headings = {
        token: {
            name: i18n._(t`Token`),
            text: i18n._(t`This is the token that is currently available to stake to the Fund.`),
        },
        protocol: {
            name: i18n._(t`Protocol`),
            text: i18n._(t`This is the protocol that the token will be staked to.`),
        },
        APY: {
            name: i18n._(t`APY`),
            text: i18n._(t`Annual Percentage Yield (APY) is the percentage yield being earned.`),
        },
        socialAPY: {
            name: i18n._(t`Social APY`),
            text: i18n._(t`This is the annual percentage of UBI your stake will create.`),
        },
        liquidity: {
            name: i18n._(t`Liquidity`),
            text: i18n._(t`Liquidity is the total value staked in the GoodDollar Trust staking contract (USD).`),
        },
        totalRewards: {
            name: i18n._(t`Total Rewards`),
            text: i18n._(t`These are the total yearly rewards in G$ and GOOD.`),
        },
    }

    // TODO: look into loading variable, it's not updating properly (loading text doesn't appear now)
    // console.log('stake loading table -->', loading)

    return isMobile ? (
        <>
            {loading && !list.items.length && (
                <div>
                    <div className="text-center">{i18n._(t`Loading...`)}</div>
                </div>
            )}
            {!loading && !list.items && (
                <div>
                    <div className="text-center">{error ? error.message : i18n._(t`No data.`)}</div>
                </div>
            )}
            {list.items &&
                list.items.map((stake: Stake) => (
                    <CellSC key={stake.address}>
                        <div className="flex items-center font-bold token flex-nowrap">
                            <AsyncTokenIcon
                                address={stake.tokens.A.address}
                                chainId={stake.tokens.A.chainId as number}
                                className="block w-5 h-5 mr-2 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                                network={network}
                            />
                            <div>
                                <div className="whitespace-nowrap">
                                    {stake.tokens.A.symbol}
                                    {stake.tokens.B !== stake.tokens.A && `/${stake.tokens.B.symbol}`}
                                </div>
                            </div>
                        </div>
                        <div className="protocol">
                            <ListHeaderWithSort sort={list} sortKey="protocol" className="title">
                                <div className="flex items-center">
                                    {headings.protocol.name}
                                    <QuestionHelper text={headings.protocol.text} />
                                </div>
                            </ListHeaderWithSort>
                            <div className="value">{stake.protocol}</div>
                        </div>
                        <div className="apy">
                            <ListHeaderWithSort sort={list} sortKey="APY" direction="descending" className="title">
                                <div className="flex items-center">
                                    {headings.APY.name}
                                    <QuestionHelper text={headings.APY.text} />
                                </div>
                            </ListHeaderWithSort>
                            <div className="value">{stake.APY ? `${stake.APY?.toFixed(2)}%` : '-'}</div>
                        </div>
                        <div className="socialapy">
                            <ListHeaderWithSort
                                sort={list}
                                sortKey="socialAPY"
                                direction="descending"
                                className="title"
                            >
                                <div className="flex items-center">
                                    {headings.socialAPY.name}
                                    <QuestionHelper text={headings.socialAPY.text} />
                                </div>
                            </ListHeaderWithSort>
                            <div className="value">{stake.socialAPY.toFixed(2)}%</div>
                        </div>
                        <div className="liquidity">
                            <ListHeaderWithSort
                                sort={list}
                                sortKey="liquidity"
                                direction="descending"
                                className="title"
                            >
                                <div className="flex items-center">
                                    {headings.liquidity.name}
                                    <QuestionHelper text={headings.liquidity.text} />
                                </div>
                            </ListHeaderWithSort>
                            <div className="value">
                                {stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? 'G$' : '$'}
                                {stake.liquidity.toSignificant(6, { groupSeparator: ',' })}
                            </div>
                        </div>
                        <div className="total">
                            <ListHeaderWithSort
                                sort={list}
                                sortKey={rewardsSortKey}
                                direction="descending"
                                className="title"
                            >
                                <div className="flex items-center">
                                    {headings.totalRewards.name}
                                    <QuestionHelper text={headings.totalRewards.text} />
                                </div>
                            </ListHeaderWithSort>
                            <div className="value">
                                {stake.rewards.G$.greaterThan(0) && (
                                    <div className="whitespace-nowrap">
                                        {stake.rewards.G$.toFixed(2, { groupSeparator: ',' })}{' '}
                                        {stake.rewards.G$.currency.symbol}
                                    </div>
                                )}
                                <div className="whitespace-nowrap">
                                    {stake.rewards.GDAO.toFixed(2, { groupSeparator: ',' })}{' '}
                                    {stake.rewards.GDAO.currency.symbol}
                                </div>
                            </div>
                        </div>
                        <div className="stake">
                            <ActionOrSwitchButton
                                size="sm"
                                borderRadius="6px"
                                noShadow={true}
                                requireChain={network.toUpperCase() as keyof typeof SupportedChains}
                                onClick={() => {
                                    sendData({
                                        event: 'stake',
                                        action: 'stakeStart',
                                        token: stake.tokens.A.symbol,
                                        type: stake.protocol,
                                        network: network,
                                    })
                                    setActiveStake(stake)
                                    setActiveTableName()
                                }}
                                ButtonEl={ButtonOutlined}
                            >
                                {i18n._(t`Stake`)}
                            </ActionOrSwitchButton>
                        </div>
                    </CellSC>
                ))}
        </>
    ) : (
        <Wrapper>
            <Table
                header={
                    <tr>
                        <th></th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="tokens.A.symbol">
                                <div className="flex items-center">
                                    {headings.token.name} <QuestionHelper text={headings.token.text} />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="protocol">
                                <div className="flex items-center">
                                    {headings.protocol.name}
                                    <QuestionHelper text={headings.protocol.text} />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        {hasAPY && (
                            <th>
                                <ListHeaderWithSort sort={list} sortKey="APY" direction="descending">
                                    <div className="flex items-center">
                                        {headings.APY.name}
                                        <QuestionHelper text={headings.APY.text} />
                                    </div>
                                </ListHeaderWithSort>
                            </th>
                        )}
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="socialAPY" direction="descending">
                                <div className="flex items-center">
                                    {headings.socialAPY.name}
                                    <QuestionHelper text={headings.socialAPY.text} />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="liquidity" direction="descending">
                                <div className="flex items-center">
                                    {headings.liquidity.name}
                                    <QuestionHelper text={headings.liquidity.text} />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey={rewardsSortKey} direction="descending">
                                <div className="flex items-center">
                                    {headings.totalRewards.name}
                                    <QuestionHelper text={headings.totalRewards.text} />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th></th>
                    </tr>
                }
            >
                {loading && !list.items.length && (
                    <tr>
                        <td colSpan={8}>
                            <div className="text-center">{i18n._(t`Loading...`)}</div>
                        </td>
                    </tr>
                )}
                {!loading && !list.items && (
                    <tr>
                        <td colSpan={8}>
                            <div className="text-center">{error ? error.message : i18n._(t`No data.`)}</div>
                        </td>
                    </tr>
                )}
                {list.items &&
                    list.items.map((stake: Stake) => {
                        return (
                            <Fragment key={stake.address}>
                                <tr>
                                    <td>
                                        <div style={{ width: 48 }}>
                                            <AsyncTokenIcon
                                                address={stake.tokens.A.address}
                                                chainId={stake.tokens.A.chainId as number}
                                                className="block w-5 h-5 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12"
                                                network={network}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="inline-flex flex-col md:flex-row">
                                            <div className="whitespace-nowrap">{stake.tokens.A.symbol}</div>
                                            {stake.tokens.B !== stake.tokens.A && <div>/{stake.tokens.B.symbol}</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="left">
                                            <strong>{stake.protocol}</strong>
                                        </div>
                                    </td>
                                    {hasAPY && (
                                        <td>
                                            <div className="left">{stake.APY?.toFixed(2)}%</div>
                                        </td>
                                    )}
                                    <td>
                                        <div className="left">{stake.socialAPY.toFixed(2)}%</div>
                                    </td>
                                    <td>
                                        <div className="center right">
                                            {stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO ? 'G$' : '$'}
                                            {stake.liquidity.toSignificant(6, { groupSeparator: ',' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="right">
                                            {stake.rewards.G$.greaterThan(0) && (
                                                <div className="whitespace-nowrap">
                                                    {stake.rewards.G$.toFixed(2, { groupSeparator: ',' })}{' '}
                                                    {stake.rewards.G$.currency.symbol}
                                                </div>
                                            )}
                                            <div className="whitespace-nowrap">
                                                {stake.rewards.GDAO.toFixed(2, { groupSeparator: ',' })}{' '}
                                                {stake.rewards.GDAO.currency.symbol}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <ActionOrSwitchButton
                                            size="sm"
                                            width="78px"
                                            borderRadius="6px"
                                            noShadow={true}
                                            requireChain={network.toUpperCase() as keyof typeof SupportedChains}
                                            page="Stake"
                                            onClick={() => {
                                                sendData({
                                                    event: 'stake',
                                                    action: 'stakeStart',
                                                    token: stake.tokens.A.symbol,
                                                    type: stake.protocol,
                                                    network: network,
                                                })
                                                setActiveStake(stake)
                                                setActiveTableName()
                                            }}
                                        >
                                            {' '}
                                            {i18n._(t`Stake`)}
                                        </ActionOrSwitchButton>
                                    </td>
                                </tr>
                                <tr className="mobile">
                                    <td colSpan={8}>
                                        <ActionOrSwitchButton
                                            size="sm"
                                            borderRadius="6px"
                                            noShadow={true}
                                            requireChain={network.toUpperCase() as keyof typeof SupportedChains}
                                            onClick={() => {
                                                sendData({
                                                    event: 'stake',
                                                    action: 'stakeStart',
                                                    token: stake.tokens.A.symbol,
                                                    type: stake.protocol,
                                                    network: network,
                                                })
                                                setActiveStake(stake)
                                                setActiveTableName()
                                            }}
                                        >
                                            {' '}
                                            {i18n._(t`Stake`)}
                                        </ActionOrSwitchButton>
                                    </td>
                                </tr>
                            </Fragment>
                        )
                    })}
            </Table>
        </Wrapper>
    )
}

const StakesSC = styled.div`
    .header {
        font-family: ${({ theme }) => theme.font.primary};
        font-style: normal;
        font-weight: 800;
        font-size: 12px;
        line-height: 24px;
        color: ${({ theme }) => theme.color.text5};
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 0;
    }
`

export default function Stakes(): JSX.Element | null {
    const { i18n } = useLingui()
    const { web3 } = useGdContextProvider()
    const { chainId } = useActiveWeb3React()
    const governanceStaking = useGovernanceStaking(web3, chainId)
    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET, web3, chainId)
    const [stakes = [], loading, error, refetch] = usePromise(async () => {
        const stakes = await (web3 && mainnetWeb3 && !disableTestnetMain.includes(chainId)
            ? getStakes(mainnetWeb3)
            : Promise.resolve([]))

        return stakes
    }, [web3, mainnetWeb3])

    const sorted = useSearchAndSort(
        stakes,
        { keys: ['tokens.A.symbol', 'tokens.B.symbol', 'tokens.A.name', 'tokens.B.name'], threshold: 0.1 },
        { key: 'tokens.A.symbol', direction: 'descending' }
    )
    const govsorted = useSearchAndSort(
        governanceStaking,
        { keys: ['tokens.A.symbol', 'tokens.A.name'], threshold: 0.1 },
        { key: 'tokens.A.symbol', direction: 'descending' }
    )

    const [activeStake, setActiveStake] = useState<Stake>()
    const [activeTableName, setActiveTableName] = useState<string>('')

    const { width } = useWindowSize()

    const isMobile = width ? width <= 768 : undefined

    useCallbackOnFocus(refetch)

    return (
        <Layout>
            {' '}
            <StakesSC>
                <MarketHeader
                    title={isMobile ? i18n._(t`Stake`) : i18n._(t`GoodStakes`)}
                    lists={sorted}
                    noSearch={stakes.length < 2}
                />
                {isMobile ? <h2 className="header">{i18n._(t`GoodStakes`)}</h2> : <div></div>}
                <StakeTable
                    list={sorted}
                    error={error}
                    loading={loading}
                    network={DAO_NETWORK.MAINNET}
                    setActiveStake={setActiveStake}
                    setActiveTableName={() => setActiveTableName('GoodStakes')}
                />
                <div className={isMobile ? 'mt-4' : 'mt-12'} />
                <MarketHeader
                    title={i18n._(t`GoodDAO Staking`)}
                    lists={sorted}
                    noSearch={govsorted.items?.length < 2}
                    titleClass={isMobile && 'header'}
                />
                <StakeTable
                    list={govsorted}
                    error={error}
                    loading={loading}
                    network={DAO_NETWORK.FUSE}
                    hasAPY={false}
                    rewardsSortKey={'rewards.GDAO'}
                    setActiveStake={setActiveStake}
                    setActiveTableName={() => setActiveTableName('GoodDAO Staking')}
                />

                <Modal isOpen={!!activeStake} showClose onDismiss={() => setActiveStake(undefined)}>
                    {activeStake && (
                        <StakeDeposit
                            stake={activeStake}
                            onDeposit={refetch}
                            onClose={() => setActiveStake(undefined)}
                            activeTableName={activeTableName}
                        />
                    )}
                </Modal>
            </StakesSC>
            <Savings />
        </Layout>
    )
}
