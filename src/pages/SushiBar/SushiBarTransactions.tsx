import React, { useContext } from 'react'
import { useTheme } from 'styled-components'
import BalanceCard from './BalanceCard'
import { Button } from '../../components'
import { ChevronLeft } from 'react-feather'
import { ChainId } from '@sushiswap/sdk'
import { SUSHI, XSUSHI } from '../../constants'
import useTokenBalance from '../../hooks/useTokenBalance'
import { useHistory } from 'react-router-dom'
import TransactionsPanel from './TransactionsPanel'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const mock = {
    totalGain: 75.72,
    avgBalStaked: 468.48
}

export default function SushiBarTransactions() {
    const { i18n } = useLingui()
    const theme = useTheme()

    const sushiBalance = useTokenBalance(SUSHI[ChainId.MAINNET]?.address ?? '')
    const xSushiBalance = useTokenBalance(XSUSHI?.address ?? '')

    const history = useHistory()

    return (
        <div style={{ flexBasis: 'fit-content' }} className="flex flex-col w-full">
            <div className="flex justify-center w-full">
                <div className="flex flex-col w-full max-w-screen-md">
                    <div className="mb-8 md:mb-3">
                        <Button size="small" className="flex items-center pl-0" onClick={() => history.goBack()}>
                            <ChevronLeft strokeWidth={2} size={18} color={theme.white} />
                            <span className="ml-1 ">{i18n._(t`Go Back`)}</span>
                        </Button>
                    </div>

                    <div className="md:hidden w-full max-w-xl mb-10">
                        <BalanceCard sushiBalance={sushiBalance} xSushiBalance={xSushiBalance} />
                    </div>

                    <div className="h5 mb-5 md:mb-3 ">{i18n._(t`Your History`)}</div>
                </div>
                <div className="hidden md:block w-72 h-full" />
            </div>
            <div className="flex flex-nowrap justify-center flex-row-reverse w-full">
                <div className="hidden md:block h-full w-72 mb-10 ml-6 mt-16">
                    <BalanceCard sushiBalance={sushiBalance} xSushiBalance={xSushiBalance} />
                </div>

                <div className="flex flex-1 max-w-screen-md flex-col mb-20 md:mb-0">
                    <TransactionsPanel />

                    <div className="hidden md:flex justify-between caption mt-4">
                        <div className="flex items-center">
                            <p className=" ">Total gain:&nbsp;</p>
                            <p className=" ">{`${mock.totalGain} SUSHI`}</p>
                        </div>
                        <div className="flex items-center">
                            <p className="">Time weighted average balance staked:&nbsp;</p>
                            <p className=" ">{`${mock.avgBalStaked} SUSHI`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
