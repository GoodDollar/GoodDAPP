import React, { useState, useCallback } from 'react'
import Card from 'components/gd/Card'
import Title from 'components/gd/Title'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import SavingsModal, { ModalType } from 'components/Savings/SavingsModal'

import Table from 'components/gd/Table'
import { QuestionHelper } from 'components'
import { useWindowSize } from 'hooks/useWindowSize'

import { SavingsCardRow } from 'components/Savings/SavingsCard/SavingsCardRow'
import { SavingsCardTableMobile } from './SavingsCardTableMobile'

export type HeadingCopy = {
    title: string
    questionText: string
    statsKey: string // key to use for mobile 'tables'
}[]

export const SavingsCard = ({
    account,
    hasBalance
}: {
    account: string
    hasBalance: boolean | undefined
}): JSX.Element => {
    const { i18n } = useLingui()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [type, setType] = useState<ModalType>()
    const { width } = useWindowSize()
    const isMobile = width ? width <= 768 : undefined

    const toggleModal = useCallback(
        (type?: ModalType) => {
            if (isModalOpen) {
                setType(undefined)
            } else {
                setType(type)
            }
            setIsModalOpen(!isModalOpen)
        },
        [setIsModalOpen, isModalOpen]
    )

    const headings: HeadingCopy = [
        {
            title: i18n._(t`TYPE`),
            questionText: i18n._(t``),
            statsKey: ''
        },
        {
            title: i18n._(t`TOKEN`),
            questionText: i18n._(t`This is the token that is currently being staked.`),
            statsKey: 'token'
        },
        {
            title: i18n._(t`PROTOCOL`),
            questionText: i18n._(t`This is the protocol that the token is staked to.`),
            statsKey: 'protocol'
        },
        {
            title: i18n._(t`DEPOSIT`),
            questionText: i18n._(t`The total of your deposits which accumulates the rewards.`),
            statsKey: 'principle'
        },
        {
            title: `${i18n._(t`CLAIMABLE REWARDS`)}`,
            questionText: i18n._(t`How much tokens your deposits have accumulated so far.`),
            statsKey: 'claimable'
        }
        // {
        //   title: `${i18n._(t`REWARDS EARNED`)}`,
        //   questionText: i18n._(t`How many rewards have you earned and withdrawn.`) // to be added for V2
        // },
    ]

    return (
        <>
            {//TODO: fix when no account connected
            type && hasBalance && <SavingsModal type={type} toggle={toggleModal} isOpen={isModalOpen} />}
            {isMobile ? (
                <SavingsCardTableMobile
                    account={account}
                    hasBalance={hasBalance}
                    headings={headings}
                    toggleModal={toggleModal}
                />
            ) : (
                <Card className="sm:mb-6 md:mb-4 card" contentWrapped={false} style={{ position: 'relative' }}>
                    <Table
                        header={
                            <tr>
                                {headings.map((item, index) => (
                                    <th key={index}>
                                        <Title type="category" className="flex items-center">
                                            {item.title} <QuestionHelper text={item.questionText || ''} />
                                        </Title>
                                    </th>
                                ))}
                            </tr>
                        }
                    >
                        {hasBalance && <SavingsCardRow account={account} toggleModal={toggleModal} />}
                    </Table>
                </Card>
            )}
        </>
    )
}
