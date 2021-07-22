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
import Title from '../../components/gd/Title'
import SwapInput from '../Swap/SwapInput'
import { Switch, Wrapper } from './styled'

export default function LendingMarkets(): JSX.Element | null {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const web3 = useWeb3()
    const [stakes, setStakes] = useState<Stake[]>([])
    useEffect(() => {
        setStakes([])
        if (chainId && web3) {
            getStakes(web3).then(setStakes, console.error)
        }
    }, [chainId, web3])

    const sorted = useSearchAndSort(
        stakes,
        { keys: ['tokens.A.symbol', 'tokens.B.symbol', 'tokens.A.name', 'tokens.B.name'], threshold: 0.1 },
        { key: 'tokens.A.symbol', direction: 'descending' }
    )
    const [activeStake, setActiveStake] = useState<Stake>()

    return (
        <Layout>
            <MarketHeader type="Stakes" lists={sorted} />
            <Wrapper>
                <Table
                    header={
                        <tr>
                            <th></th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="tokens.A.symbol">
                                    {i18n._(t`Token`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="protocol">
                                    {i18n._(t`Protocol`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="APY" direction="descending">
                                    {i18n._(t`APY`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="socialAPY" direction="descending">
                                    {i18n._(t`Social APY`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="liquidity" direction="descending">
                                    {i18n._(t`Liquidity`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={sorted} sortKey="rewards.G$" direction="descending">
                                    {i18n._(t`Total Rewards`)}
                                </ListHeaderWithSort>
                            </th>
                            <th></th>
                        </tr>
                    }
                >
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
                                                <div>
                                                    {formattedNum(stake.rewards.G$.toFixed(2))}{' '}
                                                    {stake.rewards.G$.currency.symbol}
                                                </div>
                                                <div className="">
                                                    {formattedNum(stake.rewards.GDAO.toFixed(2))}{' '}
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
                                                Stake
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
                                                Stake
                                            </ButtonAction>
                                        </td>
                                    </tr>
                                </Fragment>
                            )
                        })}
                </Table>
            </Wrapper>
            <Modal isOpen={!!activeStake} showClose onDismiss={() => setActiveStake(undefined)}>
                {activeStake && (
                    <div className="p-4">
                        <Title className="flex space-x-2 items-center justify-center mb-2">
                            <span>STAKE</span>
                            <AsyncTokenIcon
                                address={activeStake.tokens.A.address}
                                chainId={chainId}
                                className="block w-5 h-5 rounded-full"
                            />
                            <span>{activeStake.tokens.A.symbol}</span>
                        </Title>
                        <div className="flex items-center justify-between mb-3">
                            <span>How much would you like to deposit?</span>
                            <div className="flex items-center space-x-1">
                                <span>{activeStake.tokens.A.symbol}</span>
                                <Switch>
                                    <div className="area" />
                                    <input type="checkbox" />
                                    <div className="toggle" />
                                </Switch>
                                <span>{activeStake.tokens.B.symbol}</span>
                            </div>
                        </div>
                        <SwapInput balance="0.00" autoMax />
                        <ButtonAction className="mt-4">APPROVE</ButtonAction>
                    </div>
                )}
            </Modal>
        </Layout>
    )
}
