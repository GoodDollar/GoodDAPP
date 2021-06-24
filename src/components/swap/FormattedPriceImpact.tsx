import { Percent } from '@sushiswap/sdk'
import React from 'react'
import { ONE_BIPS } from '../../constants'
import { warningSeverity } from '../../utils/prices'

const SEVERITY = {
    0: 'green',
    1: '',
    2: 'yellow',
    3: 'red',
    4: 'red'
}

export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
    return (
        <div className={`  ${SEVERITY[warningSeverity(priceImpact)]}`}>
            {priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${priceImpact.toFixed(2)}%`) : '-'}
        </div>
    )
}
