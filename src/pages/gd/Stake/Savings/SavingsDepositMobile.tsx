import React, { FC, useCallback } from 'react'

import { useSavingsStats } from '@gooddollar/web3sdk-v2'
import { SavingsCellsMobile } from 'components/Savings/SavingsCard/SavingsCardTableMobile/SavingsCellsMobile'

import { ChainId } from '@sushiswap/sdk'
import type { HeadingCopy } from 'components/Savings/SavingsCard'

interface SavingsDepositMobileProps {
    headings: HeadingCopy
    requiredChain: ChainId
    showModal: (chain: ChainId) => void
}

export const SavingsDepositMobile: FC<SavingsDepositMobileProps> = ({ headings, requiredChain, showModal }) => {
    const { stats, error } = useSavingsStats(10)

    const onModalButtonPress = useCallback(() => showModal(requiredChain), [requiredChain, showModal])

    return (
        <SavingsCellsMobile
            type="stake"
            data={{ stats, error }}
            headings={headings}
            chain={requiredChain}
            toggleModal={onModalButtonPress}
        />
    )
}
