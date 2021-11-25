import { Layout, MarketHeader } from '../../kashi/components'
import { t } from '@lingui/macro'
import { formattedNum } from '../../utils'
import AsyncTokenIcon from '../../kashi/components/AsyncTokenIcon'
import ListHeaderWithSort from '../../kashi/components/ListHeaderWithSort'
import React, { Fragment, useEffect, useState } from 'react'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import useSearchAndSort from '../../hooks/useSearchAndSort'
import { useLingui } from '@lingui/react'
import Modal from '../../components/Modal'
import { ButtonAction } from '../../components/gd/Button'
import Table from '../../components/gd/Table'
import useWeb3 from '../../hooks/useWeb3'
import { getList as getStakes, Stake } from '../../sdk/staking'
import { Wrapper } from './styled'
import StakeDeposit from './StakeDeposit'
import usePromise from '../../hooks/usePromise'
import { stakesSupportedAt, SupportedChainId } from '../../sdk/constants/chains'
import Placeholder from '../../components/gd/Placeholder'
import { QuestionHelper } from '../../components'

export default function Stakes(): JSX.Element | null {
    const { i18n } = useLingui()
    const { chainId, account } = useActiveWeb3React()
    const web3 = useWeb3()
    const [stakes = [], loading, error, refetch] = usePromise(async () => {
        const [stakes] = await Promise.all([
            web3 && account && stakesSupportedAt.includes(chainId) ? getStakes(web3) : Promise.resolve([]),
            new Promise(resolve => setTimeout(resolve, 1000))
        ])
        return stakes
    }, [chainId, account])
    const sorted = useSearchAndSort(
        stakes,
        { keys: ['tokens.A.symbol', 'tokens.B.symbol', 'tokens.A.name', 'tokens.B.name'], threshold: 0.1 },
        { key: 'tokens.A.symbol', direction: 'descending' }
    )
    const [activeStake, setActiveStake] = useState<Stake>()

    const table = (
        <Wrapper>
            <Table
                header={
                    <tr>
                        <th></th>
                        <th>
                            <ListHeaderWithSort sort={sorted} sortKey="tokens.A.symbol">
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
                            <ListHeaderWithSort sort={sorted} sortKey="protocol">
                                <div className="flex items-center">
                                    {i18n._(t`Protocol`)}
                                    <QuestionHelper
                                        text={i18n._(t`This is the protocol that the token will be staked to.`)}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={sorted} sortKey="APY" direction="descending">
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
                        <th>
                            <ListHeaderWithSort sort={sorted} sortKey="socialAPY" direction="descending">
                                <div className="flex items-center">
                                    {i18n._(t`Social APY`)}
                                    <QuestionHelper
                                        text={i18n._(t`This is the annual percentage of UBI your stake will create.`)}
                                    />
                                </div>
                            </ListHeaderWithSort>
                        </th>
                        <th>
                            <ListHeaderWithSort sort={sorted} sortKey="liquidity" direction="descending">
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
                            <ListHeaderWithSort sort={sorted} sortKey="rewards.G$" direction="descending">
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
                {loading && !sorted.items.length && (
                    <tr>
                        <td colSpan={8}>
                            <div className="text-center">{i18n._(t`Loading...`)}</div>
                        </td>
                    </tr>
                )}
                {!loading && !stakes.length && (
                    <tr>
                        <td colSpan={8}>
                            <div className="text-center">{error ? error.message : i18n._(t`No data.`)}</div>
                        </td>
                    </tr>
                )}
                {sorted.items &&
                    sorted.items.map((stake: Stake) => {
                        return (
                            <Fragment key={stake.address}>
                                <tr>
                                    <td>
                                        <div style={{ width: 48 }}>
                                            <AsyncTokenIcon
                                                address={stake.tokens.A.address}
                                                chainId={chainId}
                                                className="block w-5 h-5 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg"
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="inline-flex flex-col md:flex-row">
                                            <div className="whitespace-nowrap">{stake.tokens.A.symbol}/</div>
                                            <div>{stake.tokens.B.symbol}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="left">
                                            <strong>{stake.protocol}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="left">{stake.APY.toFixed(2)}%</div>
                                    </td>
                                    <td>
                                        <div className="left">{stake.socialAPY.toFixed(2)}%</div>
                                    </td>
                                    <td>
                                        <div className="center right">
                                            ${stake.liquidity.toSignificant(6, { groupSeparator: ',' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="right">
                                            <div className="whitespace-nowrap">
                                                {stake.rewards.G$.toFixed(2, { groupSeparator: ',' })}{' '}
                                                {stake.rewards.G$.currency.symbol}
                                            </div>
                                            <div className="whitespace-nowrap">
                                                {stake.rewards.GDAO.toFixed(2, { groupSeparator: ',' })}{' '}
                                                {stake.rewards.GDAO.currency.symbol}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <ButtonAction
                                            size="sm"
                                            width="78px"
                                            borderRadius="6px"
                                            noShadow={true}
                                            onClick={() => setActiveStake(stake)}
                                        >
                                            {i18n._(t`Stake`)}
                                        </ButtonAction>
                                    </td>
                                </tr>
                                <tr className="mobile">
                                    <td colSpan={8}>
                                        <ButtonAction
                                            size="sm"
                                            style={{ width: '100%' }}
                                            borderRadius="6px"
                                            noShadow={true}
                                            onClick={() => setActiveStake(stake)}
                                        >
                                            {i18n._(t`Stake`)}
                                        </ButtonAction>
                                    </td>
                                </tr>
                            </Fragment>
                        )
                    })}
            </Table>
        </Wrapper>
    )

    return (
        <Layout>
            <MarketHeader type="Stakes" lists={sorted} noSearch={!stakes.length} />
            {account && stakesSupportedAt.includes(chainId) ? (
                table
            ) : (
                <Placeholder className="mx-4">
                    {!stakesSupportedAt.includes(chainId)
                        ? i18n._(
                              t`Switch your network to ${
                                  SupportedChainId[stakesSupportedAt[0] as any]
                              } to work with Stakes`
                          )
                        : i18n._(t`Connect to a wallet`)}
                </Placeholder>
            )}
            <Modal isOpen={!!activeStake} showClose onDismiss={() => setActiveStake(undefined)}>
                {activeStake && (
                    <StakeDeposit stake={activeStake} onDeposit={refetch} onClose={() => setActiveStake(undefined)} />
                )}
            </Modal>
        </Layout>
    )
}
