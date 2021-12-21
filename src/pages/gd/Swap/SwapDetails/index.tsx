import React, { CSSProperties, memo } from 'react'
import { SwapDetailsSC } from './styled'
import SwapInfo from '../SwapInfo'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { i18n } = useLingui()

    return (
        <SwapDetailsSC className={className} style={style} $open={open}>
            <SwapInfo
                title={i18n._(t`Minimum received`)}
                value={minimumReceived}
                tip={i18n._(
                    t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                )}
            />
            <SwapInfo
                title={i18n._(t`Price Impact`)}
                value={priceImpact}
                tip={i18n._(
                    t`Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.`
                )}
            />
            <SwapInfo
                title={i18n._(t`Liquidity Provider Fee`)}
                value={liquidityFee}
                tip={i18n._(t`A portion of each trade (0.25%) goes to liquidity providers as a protocol incentive.`)}
            />
            <SwapInfo
                title={i18n._(t`Route`)}
                value={route}
                tip={i18n._(t`Routing through these tokens resulted in the best price for your trade.`)}
            />
            {GDX && <SwapInfo title="GDX" value={GDX} />}
            {exitContribution && <SwapInfo title="EXIT CONTRIBUTION" value={exitContribution} />}
        </SwapDetailsSC>
    )
}

export default memo(SwapDetails)
