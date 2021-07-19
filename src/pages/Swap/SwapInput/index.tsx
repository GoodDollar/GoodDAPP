import React, { CSSProperties, memo, useMemo } from 'react'
import { SwapInputSC, SwapInputMaxButton, SwapInputBalance } from './styled'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export interface SwapInputProps {
    className?: string
    style?: CSSProperties
    balance?: string | number
    autoMax?: boolean
    decimals?: number
}

function SwapInput({ className, style, autoMax, balance, decimals = 18 }: SwapInputProps) {
    const mask = useMemo(
        () =>
            createNumberMask({
                prefix: '',
                includeThousandsSeparator: false,
                allowDecimal: Boolean(decimals),
                decimalSymbol: '.',
                decimalLimit: decimals
            }),
        [decimals]
    )

    return (
        <SwapInputSC className={className} style={style}>
            {balance != undefined && autoMax && <SwapInputMaxButton>max</SwapInputMaxButton>}
            <MaskedInput
                placeholder={balance ? String(balance) : '0.' + '0'.repeat(Math.min(decimals, 2))}
                mask={mask}
                guide={false}
            />
            {balance != undefined && <SwapInputBalance>Balance: {balance}</SwapInputBalance>}
        </SwapInputSC>
    )
}

export default memo(SwapInput)
