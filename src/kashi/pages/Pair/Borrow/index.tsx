import { BorrowCardHeader, Card, GradientDot, Layout } from 'kashi/components'
import { KashiContext, useKashiPair } from 'kashi/context'
import React, { useCallback, useContext, useState } from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { formattedNum, formattedPercent } from 'utils'

import AsyncTokenIcon from '../../../components/AsyncTokenIcon'
import { BackButton } from 'components'
import Borrow from './Borrow'
import BorrowGraphic from 'assets/kashi/borrow-graphic.png'
import { Helmet } from 'react-helmet'
import { KashiCooker } from 'kashi/entities'
import QuestionHelper from 'components/QuestionHelper'
import Repay from './Repay'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useLingui } from '@lingui/react'

export default function BorrowPair({
    match: {
        params: { pairAddress }
    }
}: RouteComponentProps<{ pairAddress: string }>) {
    const { i18n } = useLingui()
    const [tabIndex, setTabIndex] = useState(0)

    const { account, library, chainId } = useActiveWeb3React()

    const pair = useKashiPair(pairAddress)
    const info = useContext(KashiContext).state.info

    const addTransaction = useTransactionAdder()
    const onUpdateExchangeRate = useCallback(async () => {
        const result = await new KashiCooker(pair, account, library, chainId).updateExchangeRate().cook()

        addTransaction(result.tx, { summary: `Update ${pair.collateral.symbol}/${pair.asset.symbol} exchange rate` })
    }, [pair])

    if (!pair) return info && info.blockTimeStamp.isZero() ? null : <Redirect to="/bento/kashi/borrow"></Redirect>

    const symbol = 'ETH'
    return (
        <Layout
            left={
                <Card
                    className="h-full ark-900"
                    backgroundImage={BorrowGraphic}
                    title={i18n._(t`Add collateral in order to borrow assets`)}
                    description={i18n._(
                        t`Gain exposure to tokens without reducing your assets. Leverage will enable you to take short positions against assets and earn from downside movements.`
                    )}
                />
            }
            right={
                <Card className="h-full ark-900">
                    <div className="flex-col space-y-2">
                        <div className="flex justify-between">
                            <div className=" ">{i18n._(t`Market Info`)}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`Available`)}</div>
                            <div className="flex items-center">
                                <div className="lg ">
                                    {formattedNum(pair.totalAssetAmount.string)} {pair.asset.symbol}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`Borrowed`)}</div>
                            <div className="flex items-center">
                                <div className="lg ">{formattedPercent(pair.utilization.string)}</div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`Supply APR`)}</div>
                            <div className="flex items-center">
                                <div className="lg ">{formattedPercent(pair.currentSupplyAPR.string)}</div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`Borrow APR`)}</div>
                            <div className="flex items-center">
                                <div className="lg ">{formattedPercent(pair.currentInterestPerYear.string)}</div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`Loan to Value`)}</div>
                            <div className="lg ">75%</div>
                        </div>
                        <div className="flex justify-between pt-3">
                            <div className=" ">{i18n._(t`BentoBox`)}</div>
                        </div>
                        <div className="flex justify-between">
                            <div className="lg ">{i18n._(t`${pair.collateral.symbol} Strategy`)}</div>
                            <div className="lg ">
                                {i18n._(t`None`)}
                                <QuestionHelper
                                    text={i18n._(
                                        t`BentoBox strategies can create yield for your collateral tokens. This token does not yet have a strategy in the BentoBox.`
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            }
        >
            <Helmet>
                <title>{i18n._(t`Borrow ${pair?.asset?.symbol}-${pair?.collateral?.symbol}`)}| Sushi</title>
            </Helmet>
            <Card
                className="h-full ark-900"
                header={
                    <BorrowCardHeader>
                        <div className="flex items-center">
                            <BackButton className="hidden md:flex" defaultRoute="/bento/kashi/borrow" />
                            <div className="flex items-center space-x-2 mr-4">
                                {pair && (
                                    <>
                                        <AsyncTokenIcon
                                            address={pair?.asset.address}
                                            chainId={chainId}
                                            className="block w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                                        />
                                        <AsyncTokenIcon
                                            address={pair?.collateral.address}
                                            chainId={chainId}
                                            className="block w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="3xl ">{i18n._(t`Borrow ${pair.asset.symbol}`)}</div>
                                    <div className="flex items-center">
                                        <div className="  mr-1">{i18n._(t`Collateral`)}:</div>
                                        <div className="  mr-2">{pair.collateral.symbol}</div>
                                        <div className="  mr-1">{i18n._(t`Oracle`)}:</div>
                                        <div className=" ">{pair.oracle.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BorrowCardHeader>
                }
            >
                <div className="flex justify-between mb-8">
                    <div>
                        <div className=" lg">{i18n._(t`Collateral`)}</div>
                        <div className="blue ">
                            {formattedNum(pair.userCollateralAmount.string)} {pair.collateral.symbol}
                        </div>
                        <div className=" lg">{formattedNum(pair.userCollateralAmount.usd, true)}</div>
                    </div>
                    <div>
                        <div className=" lg">{i18n._(t`Borrowed`)}</div>
                        <div className="pink ">
                            {formattedNum(pair.currentUserBorrowAmount.string)} {pair.asset.symbol}
                        </div>
                        <div className=" lg flex items-center">
                            {formattedPercent(pair.health.string)}
                            <GradientDot percent={pair.health.string}></GradientDot>
                        </div>
                    </div>
                    <div className="right">
                        <div>
                            <div className=" lg">{i18n._(t`APR`)}</div>
                            <div className=" ">{formattedPercent(pair.interestPerYear.string)}</div>
                        </div>
                    </div>
                </div>
                <Tabs forceRenderTabPanel selectedIndex={tabIndex} onSelect={(index: number) => setTabIndex(index)}>
                    <TabList className="flex rounded p-1">
                        <Tab
                            className="flex flex-1 justify-center items-center rounded lg   cursor-pointer focus:outline-none select-none px-3 py-4"
                            selectedClassName=""
                        >
                            {i18n._(t`Borrow`)}
                        </Tab>
                        <Tab
                            className="flex flex-1 justify-center items-center rounded lg   cursor-pointer focus:outline-none select-none px-3 py-4"
                            selectedClassName=""
                        >
                            {i18n._(t`Repay`)}
                        </Tab>
                    </TabList>
                    <TabPanel>
                        <Borrow pair={pair} />
                    </TabPanel>
                    <TabPanel>
                        <Repay pair={pair} />
                    </TabPanel>
                </Tabs>
            </Card>
        </Layout>
    )
}
