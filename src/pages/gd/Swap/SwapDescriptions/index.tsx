import React, { CSSProperties, memo } from 'react'
import { SwapDescriptionsSC } from './styled'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface SwapDescriptionsProps {
    className?: string
    style?: CSSProperties
    gdx?: boolean
    exitContribution?: boolean
}

const SwapDescriptions = memo(({ className, style, gdx, exitContribution }: SwapDescriptionsProps) => {
    const { i18n } = useLingui()

    return (
        <SwapDescriptionsSC className={className} style={style}>
            {gdx && (
                <div className="block">
                    <div className="title">{i18n._(t`GDX`)}</div>
                    <div className="description">
                        {i18n._(t`GDX is a token earned by directly buying G$ from the Reserve. Members with GDX do not pay the
                        contribution exit.`)}
                    </div>
                </div>
            )}
            {exitContribution && (
                <div className="block">
                    <div className="title">{i18n._(t`What's an exit contribution?`)}</div>
                    <div className="description">
                        {i18n._(t`A contribution to the reserve paid by members for directly selling G$ tokens.`)}
                    </div>
                </div>
            )}
        </SwapDescriptionsSC>
    )
})

export default SwapDescriptions
