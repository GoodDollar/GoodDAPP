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

import Table from 'components/gd/Table'
import useWeb3 from 'hooks/useWeb3'
import { getList as getStakes, Stake } from 'sdk/staking'
import { Wrapper } from './styled'
import StakeDeposit from './StakeDeposit'
import usePromise from 'hooks/usePromise'
// import { stakesSupportedAt, SupportedChainId } from 'sdk/constants/chains'
// import Placeholder from 'components/gd/Placeholder'
import { QuestionHelper } from 'components'
import { useGovernanceStaking } from 'sdk/hooks/gov/useGovernanceStaking'
import { useEnvWeb3 } from 'sdk/hooks/useEnvWeb3'
import { DAO_NETWORK, SupportedChainId } from 'sdk/constants/chains'
import { LIQUIDITY_PROTOCOL } from 'sdk/constants/protocols'

const StakeTable = ({
    list,
    error,
    loading,
    hasAPY = true,
    rewardsSortKey = 'rewards.G$',
    network,
    setActiveStake,
    setActiveTableName
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
    
    return (
        <Wrapper>
            <Table
                header={
                    <tr>
                        <th></th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="tokens.A.symbol">
                                <div className="flex items-center">
                                    {i18n._(t`Token`)}{' '}
                                    <QuestionHelper
                                        text={i18n._(
                                            t`This is the token that is currently available to stake to the Fund.`
                                        )}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="protocol">
                                <div className="flex items-center">
                                    {i18n._(t`Protocol`)}
                                    <QuestionHelper
                                        text={i18n._(t`This is the protocol that the token will be staked to.`)}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        {hasAPY && (
                            <th>
                                <ListHeaderWithSort sort={list} sortKey="APY" direction="descending">
                                    <div className="flex items-center">
                                        {i18n._(t`APY`)}
                                        <QuestionHelper
                                            text={i18n._(
                                                t`Annual Percentage Yield (APY) is the percentage yield being earned.`
                                            )}
                                        />
                                    </div>
                                </ListHeaderWithSort>
                            </th>
                        )}
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="socialAPY" direction="descending">
                                <div className="flex items-center">
                                    {i18n._(t`Social APY`)}
                                    <QuestionHelper
                                        text={i18n._(t`This is the annual percentage of UBI your stake will create.`)}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey="liquidity" direction="descending">
                                <div className="flex items-center">
                                    {i18n._(t`Liquidity`)}
                                    <QuestionHelper
                                        text={i18n._(
                                            t`Liquidity is the total value staked in the GoodDollar Trust staking contract (USD).`
                                        )}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={list} sortKey={rewardsSortKey} direction="descending">
                                <div className="flex items-center">
                                    {i18n._(t`Total Rewards`)}
                                    <QuestionHelper
                                        text={i18n._(t`These are the total yearly rewards in G$ and GOOD.`)}
                                    />
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
                                                className="block w-5 h-5 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg"
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
                                            requireNetwork={network}
                                            onClick={() => {
                                                setActiveStake(stake)
                                                setActiveTableName()
                                            }}
                                        >
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
                                            requireNetwork={network}
                                            onClick={() => {
                                                setActiveStake(stake)
                                                setActiveTableName()
                                            }}
                                        >
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

export default function Stakes(): JSX.Element | null {
    const { i18n } = useLingui()
    const { chainId, account } = useActiveWeb3React()
    const governanceStaking = useGovernanceStaking()
    const web3 = useWeb3()
    const [mainnetWeb3, mainnetChainId] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const [stakes = [], loading, error, refetch] = usePromise(async () => {
        const [stakes] = await Promise.all([
            web3 && mainnetWeb3 ? getStakes(mainnetWeb3) : Promise.resolve([]),
            new Promise(resolve => setTimeout(resolve, 1000))
        ])
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

    return (
        <Layout>
            <MarketHeader title={i18n._(t`GoodStakes`)} lists={sorted} noSearch={stakes.length < 2} />
            <StakeTable
                list={sorted}
                error={error}
                loading={loading}
                network={DAO_NETWORK.MAINNET}
                setActiveStake={setActiveStake}
                setActiveTableName={() => setActiveTableName('GoodStakes')}
            />
            <div className="mt-12" />
            <MarketHeader title={i18n._(t`GoodDAO Staking`)} lists={sorted} noSearch={govsorted.items?.length < 2} />
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
        </Layout>
    )
}
