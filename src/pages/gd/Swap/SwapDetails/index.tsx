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
    buying?: boolean
}

const SwapDetails = memo(
    ({
        className,
        style,
        open,
        minimumReceived,
        priceImpact,
        liquidityFee,
        route,
        GDX,
        exitContribution,
        buying,
    }: SwapDetailsProps) => {
        const { i18n } = useLingui()

        return (
            <SwapDetailsSC className={className} style={style} $open={open}>
                <SwapInfo
                    title={i18n._(t`Minimum received`)}
                    value={minimumReceived}
                    tip={i18n._(t`The minimum amount of tokens to receive.`)}
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
                    tip={i18n._(
                        t`Swapping G$ against GoodReserve has no third party fees if you swap from/to cDAI as it's our reserve token. Swapping G$s from/to other assets implies a 0.3% of fee going to 3rd party AMM liquidity providers.`
                    )}
                />
                <SwapInfo
                    title={i18n._(t`Route`)}
                    value={route}
                    tip={i18n._(t`Routing through these tokens resulted in the best price for your trade.`)}
                />
                {GDX && (
                    <SwapInfo
                        tip={i18n._(
                            t`GDX is a token earned by directly buying G$ from the Reserve. Members with GDX do not pay the contribution exit.`
                        )}
                        title="GDX"
                        value={buying !== undefined ? (buying ? '+' + GDX : '-' + GDX) : GDX}
                    />
                )}
                {exitContribution && (
                    <SwapInfo
                        tip={i18n._(t`A contribution to the reserve paid by members for directly selling G$ tokens.`)}
                        title="EXIT CONTRIBUTION"
                        value={exitContribution}
                    />
                )}
            </SwapDetailsSC>
        )
    }
)

export default SwapDetails
