import { Card, GradientDot, Layout, LendCardHeader } from '../../../components'
import { KashiContext, useKashiPair } from 'kashi/context'
import React, { useContext, useState } from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { formattedNum, formattedPercent } from 'utils'

import AsyncTokenIcon from '../../../components/AsyncTokenIcon'
import { BackButton } from 'components'
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { useLingui } from '@lingui/react'

export default function LendingPair({ pairAddress }: { pairAddress: string }) {
    const { i18n } = useLingui()
    const [tabIndex, setTabIndex] = useState(0)

    const { chainId } = useActiveWeb3React()

    const pair = useKashiPair(pairAddress)
    const info = useContext(KashiContext).state.info

    if (!pair) return info && info.blockTimeStamp.isZero() ? null : <Redirect to="/bento/kashi/lend"></Redirect>

    return (
        <div>
            <div className="flex justify-between mb-8">
                <div>
                    <div className=" lg">Lent</div>
                    <div className="blue ">
                        {formattedNum(pair.currentUserAssetAmount.string)} {pair.asset.symbol}
                    </div>
                    <div className=" lg">{formattedNum(pair.currentUserAssetAmount.usd, true)}</div>
                </div>
                <div>
                    <div className=" lg">Borrowed</div>
                    <div className=" ">{formattedPercent(pair.utilization.string)}</div>
                </div>
                <div className="right">
                    <div>
                        <div className=" lg">Supply APR</div>
                        <div className=" ">{formattedPercent(pair.supplyAPR.string)}</div>
                    </div>
                </div>
            </div>

            <Deposit pair={pair} />
        </div>
    )
}
