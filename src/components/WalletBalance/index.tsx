import React, { memo } from 'react'
import { ChainId } from '@sushiswap/sdk'
import { Fragment } from 'react'
import { LoadingPlaceHolder } from 'theme/components'
import { G$Balances } from '@gooddollar/web3sdk-v2'
import { AdditionalChainId } from '../../constants'
import { Text, useColorModeValue } from 'native-base'

export type WalletBalanceProps = {
    balances: G$Balances
    chainId: ChainId
}

const chains = Object.values(AdditionalChainId)

const WalletBalance = memo(({ balances, chainId }: WalletBalanceProps): JSX.Element | null => {
    const textColor = useColorModeValue('goodGrey.700', 'goodGrey.300')

    return (
        <div className="flex flex-col">
            {balances &&
                Object.entries(balances).map((balance) => {
                    const ticker = balance[0]
                    const amount = balance[1]

                    if (balance[0] === 'GDX' && chains.includes(chainId as any)) {
                        return <div key={ticker}></div>
                    }
                    return (
                        <Fragment key={ticker}>
                            <span className="flex">
                                {!amount ? (
                                    <LoadingPlaceHolder />
                                ) : (
                                    <Text fontFamily="subheading" color={textColor} fontSize="sm">
                                        {amount?.format({ suffix: '', prefix: amount.currency?.ticker + ' - ' })}
                                    </Text>
                                )}
                            </span>
                        </Fragment>
                    )
                })}
        </div>
    )
})

export default WalletBalance
