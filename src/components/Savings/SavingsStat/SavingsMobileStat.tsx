import React, { FC, memo, useMemo } from 'react'
import { LoadingPlaceHolder } from 'theme/components'

import { SavingsStats, StakerInfo } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

import { ChainId } from '@sushiswap/sdk'
import { NETWORK_LABEL } from 'constants/networks'

interface SavingsMobileStatProps {
    stats?: SavingsStats | StakerInfo
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

    let statsValue: any

    for (const [key, value] of Object.entries(stats)) {
        if (key === statsKey) {
            statsValue = value
        }
    }

    switch (statsKey) {
        case 'token':
            return <div>{i18n._(t`G$`)}</div>
        case 'protocol':
            return <div>{i18n._(t`GoodDollar`)}</div>
        case 'network':
            return <>{NETWORK_LABEL[requiredChain]}</>
        case 'apy':
            return <div>{`${statsValue?.toFixed(0)} %` ?? placeholder}</div>
        case 'totalStaked':
        case 'principle':
            return <>{statsValue?.format(fmtOpts) ?? placeholder}</>
        case 'totalRewardsPaid':
            return <>{statsValue?.format() ?? placeholder}</>
        case 'claimable':
            return (
                <>
                    {statsValue ? (
                        <>
                            <div>{statsValue.g$Reward.format()}</div>
                            <div>{statsValue.goodReward.format()}</div>
                        </>
                    ) : (
                        placeholder
                    )}
                </>
            )
        default:
            return null
    }
})
