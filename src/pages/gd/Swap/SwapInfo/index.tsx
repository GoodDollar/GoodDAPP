import React, { CSSProperties, memo, ReactNode } from 'react'
import { SwapInfoSC } from './styled'
import { QuestionHelper } from 'components'

export interface SwapInfoProps {
    className?: string
    style?: CSSProperties
    title: string
    value: ReactNode
    tip?: string
}

const SwapInfo = memo(({ className, style, tip, title, value }: SwapInfoProps) => {
    return (
        <SwapInfoSC className={className} style={style}>
            <div className="title flex items-center">
                {title} {tip && <QuestionHelper text={tip} />}
            </div>
            <div className="value">{value}</div>
        </SwapInfoSC>
    )
});

export default SwapInfo;
