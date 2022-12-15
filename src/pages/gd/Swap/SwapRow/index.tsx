import React, { CSSProperties, memo, useCallback, useState, ChangeEvent } from 'react'
import { SwapRowSC, SwapRowIconSC, SwapRowCurrencySC } from './styled'
import SwapInput from '../SwapInput'
import SwapTokensModal from '../SwapTokensModal'
import { Currency, CurrencyAmount } from '@sushiswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'

const arrow = (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.53892 7.1527L11.7844 1.90719C12.0719 1.6018 12.0719 1.13474 11.7844 0.847313C11.497 0.559888 11.0299 0.559888 10.7246 0.847313L6 5.57187L1.27545 0.847313C0.988027 0.559888 0.502997 0.559888 0.215572 0.847313C-0.0718527 1.13474 -0.0718527 1.6018 0.215572 1.90719L5.47904 7.1527C5.76647 7.44013 6.23353 7.44013 6.53892 7.1527Z"
            fill="currentColor"
        />
    </svg>
)

export interface SwapRowProps {
    className?: string
    style?: CSSProperties
    title: string
    select: boolean
    balance?: CurrencyAmount
    autoMax?: boolean
    value?: string
    onValueChange?: (value: string) => any
    token?: Currency
    tokenList?: Currency[]
    onTokenChange?: (token: Currency) => any
    alternativeSymbol?: string
    isCalculating?: boolean
}

const SwapRow = memo(
    ({
        className,
        style,
        title,
        select,
        balance,
        autoMax,
        value,
        onValueChange,
        token,
        onTokenChange,
        tokenList,
        alternativeSymbol,
        isCalculating,
    }: SwapRowProps) => {
        const [showSelect, setShowSelect] = useState(false)

        const handleShowSelect = useCallback(() => setShowSelect(true), [])
        const handleCloseSelect = useCallback(() => setShowSelect(false), [])
        const handleInputChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => onValueChange && onValueChange(event.currentTarget.value),
            [onValueChange]
        )
        const handleSetMax = useCallback(
            () => onValueChange && balance != null && onValueChange(balance.toExact()),
            [balance, onValueChange]
        )

        return (
            <SwapRowSC className={className} style={style}>
                <div className="flex space-x-4 select">
                    <SwapRowIconSC onClick={select ? handleShowSelect : undefined} as={select ? 'button' : undefined}>
                        {token?.name === 'GoodDollar' ? (
                            <CurrencyLogo currency={token} size={'54px'} style={{ backgroundColor: 'white' }} />
                        ) : (
                            <CurrencyLogo currency={token} size={'54px'} />
                        )}
                    </SwapRowIconSC>
                    <div className="flex flex-col">
                        <div className="title">{title}</div>
                        <SwapRowCurrencySC
                            className="flex items-center space-x-1.5"
                            onClick={select ? handleShowSelect : undefined}
                            as={select ? 'button' : undefined}
                        >
                            <span>{token?.getSymbol() || alternativeSymbol}</span>
                            {select && arrow}
                        </SwapRowCurrencySC>
                    </div>
                </div>
                <div className="input">
                    <SwapInput
                        autoMax={autoMax}
                        balance={balance?.toSignificant(6, { groupSeparator: ',' }) ?? 0}
                        value={value}
                        decimals={token?.decimals}
                        onMax={handleSetMax}
                        onChange={handleInputChange}
                        {...(isCalculating && { calculating: isCalculating })}
                    />
                </div>
                {select && (
                    <SwapTokensModal
                        open={showSelect}
                        token={token}
                        tokenList={tokenList}
                        onClose={handleCloseSelect}
                        onTokenChange={onTokenChange}
                    />
                )}
            </SwapRowSC>
        )
    }
)

export default SwapRow
