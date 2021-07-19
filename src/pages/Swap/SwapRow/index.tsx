import React, { CSSProperties, memo } from 'react'
import { SwapRowSC, SwapRowIconSC } from './styled'
import SwapInput from '../SwapInput'

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
    balance?: string | number
    autoMax?: boolean
}

function SwapRow({ className, style, title, select, balance, autoMax }: SwapRowProps) {
    return (
        <SwapRowSC className={className} style={style}>
            <div className="select flex space-x-4">
                <SwapRowIconSC />
                <div className="flex flex-col">
                    <div className="title">{title}</div>
                    <div className="currency flex items-center space-x-1.5">
                        <span>ETH</span>
                        {select && arrow}
                    </div>
                </div>
            </div>
            <div className="input">
                <SwapInput autoMax={autoMax} balance={balance} />
            </div>
        </SwapRowSC>
    )
}

export default memo(SwapRow)
