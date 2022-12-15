import React, { CSSProperties, memo } from 'react'
import { SwapTokensModalTokenRowSC } from './styled'
import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@sushiswap/sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCurrencyBalance } from 'state/wallet/hooks'
import Loader from 'components/Loader'

export interface SwapTokensModalTokenRowProps extends Omit<JSX.IntrinsicElements['div'], 'ref'> {
    className?: string
    style?: CSSProperties
    token: Currency
    active: boolean
}

const SwapTokensModalTokenRow = memo(
    ({ className, style, token, active, ...divProps }: SwapTokensModalTokenRowProps) => {
        const { account } = useActiveWeb3React()
        const balance = useCurrencyBalance(account ?? undefined, token)

        return (
            <SwapTokensModalTokenRowSC className={className} style={style} $active={active} {...divProps}>
                <div className="icon">
                    <CurrencyLogo currency={token} size={'32px'} />
                </div>
                <div className="title">{token.getSymbol()}</div>
                <div className="subtitle">{token.getName()}</div>
                <div className="balance">{balance ? balance.toSignificant(4) : account ? <Loader /> : null}</div>
            </SwapTokensModalTokenRowSC>
        )
    }
)

export default SwapTokensModalTokenRow
