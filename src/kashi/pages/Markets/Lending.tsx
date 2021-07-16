import { Card, Layout, MarketHeader } from '../../components'
import { Trans, t } from '@lingui/macro'
import { formattedNum, formattedPercent } from '../../../utils'

import AsyncTokenIcon from '../../components/AsyncTokenIcon'
import DepositGraphic from 'assets/kashi/deposit-graphic.png'
import { Link } from 'react-router-dom'
import ListHeaderWithSort from 'kashi/components/ListHeaderWithSort'
import QuestionHelper from '../../../components/QuestionHelper'
import React, { useState } from 'react'
import { ZERO } from '../../functions'
import { getCurrency } from 'kashi/constants'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useKashiPairs } from '../../context'
import useSearchAndSort from 'hooks/useSearchAndSort'
import { useLingui } from '@lingui/react'
import styled from 'styled-components'
import Modal from '../../../components/Modal'
import LendingPair from '../Pair/Lend'
import { ButtonAction } from '../../../components/gd/Button'
import Table, { TableSC } from '../../../components/gd/Table'

const Wrapper = styled.div`
    background: ${({ theme }) => theme.color.bg1};
    box-shadow: ${({ theme }) => theme.shadow.settings};
    border-radius: 12px;
    padding: 14px 19px 15px 19px;

    ${TableSC} {
        @media ${({ theme }) => theme.media.md} {
            td,
            th {
                &:nth-child(2),
                &:nth-child(3),
                &:nth-child(4),
                &:nth-child(6),
                &:nth-child(8) {
                    display: none;
                }
            }

            td:nth-child(7) {
                border-right: 1px solid ${({ theme }) => theme.color.border2};
                border-top-right-radius: 12px;
            }
        }
    }
`

export default function LendingMarkets(): JSX.Element | null {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const fullPairs = useKashiPairs()
    const netWorth: string = fullPairs.reduce((a, b) => a.add(b.netWorth), ZERO).toFixed(getCurrency(chainId).decimals)

    const positions = useSearchAndSort(
        fullPairs.filter((pair: any) => pair.userAssetFraction.gt(0)),
        { keys: ['search'], threshold: 0.1 },
        { key: 'currentUserAssetAmount.usdValue', direction: 'descending' }
    )

    const pairs = useSearchAndSort(
        fullPairs,
        { keys: ['search'], threshold: 0.1 },
        { key: 'currentSupplyAPR.value', direction: 'descending' }
    )
    const [activePair, setActivePair] = useState<ArrayType<typeof pairs.items>>()

    return (
        <Layout>
            <MarketHeader type="Stakes" lists={[pairs, positions]} />
            <Wrapper>
                <Table
                    header={
                        <tr>
                            <th>
                                {/*<ListHeaderWithSort sort={pairs} sortKey="search">
                                    {i18n._(t`Markets`)}
                                </ListHeaderWithSort>*/}
                            </th>
                            <th>
                                <ListHeaderWithSort className="hidden md:flex" sort={pairs} sortKey="asset.symbol">
                                    {i18n._(t`Lending`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort className="hidden md:flex" sort={pairs} sortKey="collateral.symbol">
                                    {i18n._(t`Collateral`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort className="hidden lg:flex" sort={pairs} sortKey="oracle.name">
                                    {i18n._(t`Oracle`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort
                                    sort={pairs}
                                    sortKey="currentSupplyAPR.value"
                                    direction="descending"
                                >
                                    {i18n._(t`APR`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort sort={pairs} sortKey="utilization.value" direction="descending">
                                    {i18n._(t`Borrowed`)}
                                </ListHeaderWithSort>
                            </th>
                            <th>
                                <ListHeaderWithSort
                                    sort={pairs}
                                    sortKey="currentAllAssets.usdValue"
                                    direction="descending"
                                >
                                    {i18n._(t`Total`)}
                                </ListHeaderWithSort>
                            </th>
                            <th></th>
                        </tr>
                    }
                >
                    {pairs.items &&
                        pairs.items.map(pair => {
                            return (
                                <>
                                    <tr key={pair.address}>
                                        <td>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                                <div className="hidden space-x-2 md:flex">
                                                    <AsyncTokenIcon
                                                        address={pair.asset.address}
                                                        chainId={chainId}
                                                        className="block w-5 h-5 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg"
                                                    />
                                                    <AsyncTokenIcon
                                                        address={pair.collateral.address}
                                                        chainId={chainId}
                                                        className="block w-5 h-5 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg"
                                                    />
                                                </div>
                                                <div className="sm:items-end md:hidden">
                                                    <div className="flex flex-col md:flex-row">
                                                        <div className="">{pair.asset.symbol} / </div>
                                                        <div>{pair.collateral.symbol}</div>
                                                    </div>
                                                    <div className="mt-0 left  xs block lg:hidden">
                                                        {pair.oracle.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="left hidden md:block">
                                                <strong>{pair.asset.symbol}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="left hidden md:block">{pair.collateral.symbol}</div>
                                        </td>
                                        <td>
                                            <div className="left hidden lg:block">{pair.oracle.name}</div>
                                        </td>
                                        <td>
                                            <div className="center right">
                                                {formattedPercent(pair.currentSupplyAPR.string)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="right hidden sm:block">
                                                {formattedPercent(pair.utilization.string)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="right">
                                                <div>
                                                    {formattedNum(pair.currentAllAssets.string)} {pair.asset.symbol}
                                                </div>
                                                <div className="">{formattedNum(pair.currentAllAssets.usd, true)}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <ButtonAction
                                                size="sm"
                                                width="78px"
                                                borderRadius="6px"
                                                noShadow={true}
                                                onClick={() => setActivePair(pair)}
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
                                                onClick={() => setActivePair(pair)}
                                            >
                                                Stake
                                            </ButtonAction>
                                        </td>
                                    </tr>
                                </>
                            )
                        })}
                </Table>
            </Wrapper>
            <Modal isOpen={!!activePair} onDismiss={() => {}}>
                {activePair && <LendingPair pairAddress={activePair.address} />}
            </Modal>
        </Layout>
    )
}
