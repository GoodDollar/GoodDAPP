import React, { memo } from 'react'
import { ChainId } from '@sushiswap/sdk'
import { Fragment } from 'react'
import { LoadingPlaceHolder } from 'theme/components'
import { G$Balances } from '@gooddollar/web3sdk-v2'
import { AdditionalChainId } from '../../constants'

export type WalletBalanceProps = {
    balances: G$Balances
    chainId: ChainId
}

const chains = Object.values(AdditionalChainId)

const WalletBalance = memo(({ balances, chainId }: WalletBalanceProps): JSX.Element | null => (
    <div className="flex flex-col">
        {balances &&
            Object.entries(balances).map((balance, index) => {
                const amount = balance[1]

                if (balance[0] === 'GDX' && chains.includes(chainId as any)) {
                    return <div key={index}></div>
                }
                return (
                    <Fragment key={balance[0]}>
                        <span className="flex">
                            {!amount ? (
                                <LoadingPlaceHolder />
                            ) : (
                                amount?.format({ suffix: '', prefix: amount.currency?.ticker + ' - ' })
                            )}
                        </span>
                    </Fragment>
                )
            })}
    </div>
))

export default WalletBalance
