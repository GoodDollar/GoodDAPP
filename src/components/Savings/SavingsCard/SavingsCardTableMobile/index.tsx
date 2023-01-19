import React from 'react'
import { useStakerInfo } from '@gooddollar/web3sdk-v2'

import Card from 'components/gd/Card'
import { ModalType } from 'components/Savings/SavingsModal'

import type { HeadingCopy } from '..'
import { ChainId } from '@sushiswap/sdk'
import { SavingsCellsMobile } from './SavingsCellsMobile'
import useHasBalance from 'hooks/useHasBalance'

export const SavingsCardTableMobile = ({
    account,
    requiredChain,
    headings,
    toggleModal,
}: {
    account: string
    requiredChain: ChainId
    headings: HeadingCopy
    toggleModal: (type?: ModalType) => void
}): JSX.Element => {
    const { stats, error } = useStakerInfo(requiredChain, 10, account)
    const hasBalance = useHasBalance(account, requiredChain)

    return (
        <>
            {hasBalance && (
                <Card className="mb-6 md:mb-4 card">
                    <SavingsCellsMobile
                        type="portfolio"
                        data={{ stats, error }}
                        headings={headings}
                        chain={requiredChain}
                        toggleModal={toggleModal}
                    />
                </Card>
            )}
        </>
    )
}
