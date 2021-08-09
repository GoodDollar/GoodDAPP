import React, { CSSProperties, memo } from 'react'
import { SwapDetailsSC } from './styled'
import SwapInfo from '../SwapInfo'

export interface SwapDetailsFields {
    minimumReceived?: string | null
    priceImpact?: string | null
    liquidityFee?: string | null
    route?: string | null
    GDX?: string | null
    exitContribution?: string | null
}

export interface SwapDetailsProps extends SwapDetailsFields {
    className?: string
    style?: CSSProperties
    open?: boolean
}

function SwapDetails({
    className,
    style,
    open,
    minimumReceived,
    priceImpact,
    liquidityFee,
    route,
    GDX,
    exitContribution
}: SwapDetailsProps) {
    return (
        <SwapDetailsSC className={className} style={style} $open={open}>
            <SwapInfo
                title="Minimum received"
                value={minimumReceived}
                tip="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
            />
            <SwapInfo
                title="Price Impact"
                value={priceImpact}
                tip="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
            />
            <SwapInfo
                title="Liquidity Provider Fee"
                value={liquidityFee}
                tip="A portion of each trade (0.25%) goes to liquidity providers as a protocol incentive."
            />
            <SwapInfo
                title="Route"
                value={route}
                tip="Routing through these tokens resulted in the best price for your trade."
            />
            {GDX && <SwapInfo title="GDX" value={GDX} />}
            {exitContribution && <SwapInfo title="EXIT CONTRIBUTION" value={exitContribution} />}
        </SwapDetailsSC>
    )
}

export default memo(SwapDetails)
