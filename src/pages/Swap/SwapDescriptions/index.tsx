import React, { CSSProperties, memo, ReactNode } from 'react'
import { SwapDescriptionsSC } from './styled'
import { QuestionHelper } from '../../../components'

export interface SwapDescriptionsProps {
    className?: string
    style?: CSSProperties
    gdx?: boolean
    exitContribution?: boolean
}

function SwapDescriptions({ className, style, gdx, exitContribution }: SwapDescriptionsProps) {
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
                    <div className="title">What&apos;s an exit contribution?</div>
                    <div className="description">Some descriptive text goes here</div>
                </div>
            )}
        </SwapDescriptionsSC>
    )
}

export default memo(SwapDescriptions)
