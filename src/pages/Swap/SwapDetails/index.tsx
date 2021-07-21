import React, { CSSProperties, memo } from 'react'
import { SwapDetailsSC } from './styled'
import SwapInfo from '../SwapInfo'

export interface SwapDetailsProps {
    className?: string
    style?: CSSProperties
    open?: boolean
}

function SwapDetails({ className, style, open }: SwapDetailsProps) {
    return (
        <SwapDetailsSC className={className} style={style} $open={open}>
            <SwapInfo
                title="Minimum received"
                value="37.94 GOO"
                tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at aut enim harum minima nostrum odit, quis quos sapiente sed sint sunt voluptas voluptatem! Cumque distinctio impedit repellendus tempore. Ullam."
            />
            <SwapInfo
                title="Price Impact"
                value="2.10%"
                tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at aut enim harum minima nostrum odit, quis quos sapiente sed sint sunt voluptas voluptatem! Cumque distinctio impedit repellendus tempore. Ullam."
            />
            <SwapInfo
                title="Liquidity Provider Fee"
                value="0.00116 ETH"
                tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at aut enim harum minima nostrum odit, quis quos sapiente sed sint sunt voluptas voluptatem! Cumque distinctio impedit repellendus tempore. Ullam."
            />
            <SwapInfo
                title="Route"
                value="ETH  >  DAI  >  cDAI  >  GOO"
                tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at aut enim harum minima nostrum odit, quis quos sapiente sed sint sunt voluptas voluptatem! Cumque distinctio impedit repellendus tempore. Ullam."
            />
            <SwapInfo
                title="GDX"
                value="+37.9877"
                tip="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at aut enim harum minima nostrum odit, quis quos sapiente sed sint sunt voluptas voluptatem! Cumque distinctio impedit repellendus tempore. Ullam."
            />
        </SwapDetailsSC>
    )
}

export default memo(SwapDetails)
