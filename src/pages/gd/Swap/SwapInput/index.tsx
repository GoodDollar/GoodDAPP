import React, { CSSProperties, memo, MouseEventHandler, useMemo } from 'react'
import { SwapInputSC, SwapInputMaxButton, SwapInputBalance } from './styled'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { CustomLightSpinner } from 'theme'
import Circle from 'assets/images/blue-loader.svg'

import { Calculating } from 'theme/components'

export interface SwapInputProps extends Omit<JSX.IntrinsicElements['input'], 'ref'> {
    className?: string
    style?: CSSProperties
    balance?: string | number
    autoMax?: boolean
    decimals?: number
    onMax?: MouseEventHandler<HTMLButtonElement>,
    calculating?: boolean
}

const SwapInput = memo(({ className, style, autoMax, balance, decimals = 18, onMax, ...inputProps }: SwapInputProps) => {
    const { i18n } = useLingui()

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
        <>
            <SwapInputSC className={className} style={style}>
                {balance != undefined && autoMax && (
                    <SwapInputMaxButton disabled={inputProps.disabled} onClick={onMax}>
                        {i18n._(t`max`)}
                    </SwapInputMaxButton>
                )}
                { inputProps.calculating ? 
                  <Calculating /> :
                  <MaskedInput
                    placeholder={'0.' + '0'.repeat(Math.min(decimals, 2))}
                    mask={mask}
                    guide={false}
                    size={1}
                    {...inputProps}
                  />
                }
            </SwapInputSC>
            {balance != undefined && (
                <SwapInputBalance className="mt-2">
                    {i18n._(t`Balance`)}: {balance}
                </SwapInputBalance>
            )}
        </>
    )
});

export default SwapInput;
