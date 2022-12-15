import React, { memo } from 'react'
import { ChainId } from '@sushiswap/sdk'
import { Fragment } from 'react'
import { LoadingPlaceHolder } from 'theme/components'
import { AdditionalChainId } from '../../constants'
import { G$Balances } from '@gooddollar/web3sdk-v2'

export type WalletBalanceProps = {
    balances: G$Balances
    chainId: ChainId
}

const chains = Object.values(AdditionalChainId)

const WalletBalance = memo(({ balances, chainId }: WalletBalanceProps): JSX.Element | null => (
    <div className="flex flex-col">
        {balances &&
            Object.entries(balances).map((balance) => {
                const [token, data] = balance || []
                const { amount } = data || {}

                if (token === 'GDX' && chains.includes(chainId as any)) {
                    return <div key={token}></div>
                }

                return (
                    <Fragment key={token}>
                        <span className="flex">
                            {!amount ? (
                                <LoadingPlaceHolder />
                            ) : (
                                amount.format({ suffix: '', prefix: amount.currency.ticker + ' - ' })
                            )}
                        </span>
                    </Fragment>
                )
            })}
    </div>
))

export default WalletBalance
