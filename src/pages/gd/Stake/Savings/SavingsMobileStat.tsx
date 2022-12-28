import React, { FC, memo, useMemo } from 'react'
import { LoadingPlaceHolder } from 'theme/components'

import { SavingsStats } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

import { ChainId } from '@sushiswap/sdk'
import { NETWORK_LABEL } from 'constants/networks'

interface SavingsMobileStatProps {
    stats?: SavingsStats
    statsError?: any[]
    statsKey: string
    requiredChain: ChainId
}

const fmtOpts = {
    useFixedPrecision: true,
    fixedPrecisionDigits: 2,
}

export const SavingsMobileStat: FC<SavingsMobileStatProps> = memo(({ stats, statsKey, statsError, requiredChain }) => {
    const { i18n } = useLingui()
    const placeholder = useMemo(() => <LoadingPlaceHolder />, [])

    if (statsError) {
        return placeholder
    }

    if (!stats) {
        return null
    }

    const { apy, totalStaked, totalRewardsPaid } = stats

    switch (statsKey) {
        case 'token':
            return <div>{i18n._(t`G$`)}</div>
        case 'protocol':
            return <div>{i18n._(t`GoodDollar`)}</div>
        case 'network':
            return <>{NETWORK_LABEL[requiredChain]}</>
        case 'apy':
            return <div>{apy ? `${apy.toFixed(0)} %` : placeholder}</div>
        case 'totalStaked':
            return <>{totalStaked?.format(fmtOpts) ?? placeholder}</>
        case 'totalRewardsPaid':
            return <>{totalRewardsPaid?.format() ?? placeholder}</>
        default:
            return null
    }
})
