import React, { CSSProperties, memo, ReactNode } from 'react'
import { SwapDescriptionsSC } from './styled'
import { QuestionHelper } from '../../../components'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface SwapDescriptionsProps {
    className?: string
    style?: CSSProperties
    gdx?: boolean
    exitContribution?: boolean
}

function SwapDescriptions({ className, style, gdx, exitContribution }: SwapDescriptionsProps) {
    const { i18n } = useLingui()

    return (
        <SwapDescriptionsSC className={className} style={style}>
            {gdx && (
                <div className="block">
                    <div className="title">GDX is...</div>
                    <div className="description">Some descriptive text goes here</div>
                </div>
            )}
            {exitContribution && (
                <div className="block">
                    <div className="title">{i18n._(t`What's an exit contribution?`)}</div>
                    <div className="description">Some descriptive text goes here</div>
                </div>
            )}
        </SwapDescriptionsSC>
    )
}

export default memo(SwapDescriptions)
