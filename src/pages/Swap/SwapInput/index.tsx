import React, { CSSProperties, memo, MouseEventHandler, useMemo } from 'react'
import { SwapInputSC, SwapInputMaxButton, SwapInputBalance } from './styled'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export interface SwapInputProps extends Omit<JSX.IntrinsicElements['input'], 'ref'> {
    className?: string
    style?: CSSProperties
    balance?: string | number
    autoMax?: boolean
    decimals?: number
    onMax?: MouseEventHandler<HTMLButtonElement>
}

function SwapInput({ className, style, autoMax, balance, decimals = 18, onMax, ...inputProps }: SwapInputProps) {
    const mask = useMemo(
        () =>
            createNumberMask({
                prefix: '',
                includeThousandsSeparator: false,
                allowDecimal: Boolean(decimals),
                decimalLimit: decimals
            }),
        [decimals]
    )

    return (
        <SwapInputSC className={className} style={style}>
            {balance != undefined && autoMax && (
                <SwapInputMaxButton disabled={inputProps.disabled} onClick={onMax}>
                    max
                </SwapInputMaxButton>
            )}
            <MaskedInput
                placeholder={'0.' + '0'.repeat(Math.min(decimals, 2))}
                mask={mask}
                guide={false}
                size={1}
                {...inputProps}
            />
            {balance != undefined && <SwapInputBalance>Balance: {balance}</SwapInputBalance>}
        </SwapInputSC>
    )
}

export default memo(SwapInput)
