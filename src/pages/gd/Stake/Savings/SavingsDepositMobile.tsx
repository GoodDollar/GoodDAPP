import { QuestionHelper } from 'components'
import Title from 'components/gd/Title'
import React, { FC, useCallback } from 'react'
import { CellSC } from '../styled'

import { useSavingsStats } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ModalButton } from 'components/Savings/SavingsModal/ModalButton'

import { ChainId } from '@sushiswap/sdk'
import type { HeadingCopy } from 'components/Savings/SavingsCard'
import { SavingsMobileStat } from './SavingsMobileStat'

interface SavingsDepositMobileProps {
    headings: HeadingCopy
    requiredChain: ChainId
    showModal: (chain: ChainId) => void
}

export const SavingsDepositMobile: FC<SavingsDepositMobileProps> = ({ headings, requiredChain, showModal }) => {
    const { stats, error } = useSavingsStats(10)
    const { i18n } = useLingui()

    const onModalButtonPress = useCallback(() => showModal(requiredChain), [requiredChain, showModal])

    return (
        <CellSC>
            {headings.map(
                (item, index) =>
                    index !== 0 && ( // skip token header on mobile
                        <div key={index}>
                            <div key={index} className="flex flex-grow-1">
                                <Title type="category" className="flex items-center title">
                                    {item.title} <QuestionHelper text={item.questionText || ''} />
                                </Title>
                            </div>
                            <div className="font-bold value">
                                <SavingsMobileStat
                                    statsKey={item.statsKey}
                                    stats={stats}
                                    requiredChain={requiredChain}
                                    statsError={error}
                                />
                            </div>
                        </div>
                    )
            )}
            <div className="savingdeposit">
                <ModalButton
                    type={'deposit'}
                    title={i18n._(t`Deposit G$`)}
                    chain={requiredChain}
                    toggleModal={onModalButtonPress}
                />
            </div>
        </CellSC>
    )
}
