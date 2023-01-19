import React, { useState, useCallback, useMemo } from 'react'
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
import Web3SupportedNetworks, { IWeb3SupportedNetworksProps } from 'components/Web3SupportedNetworks'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

export type HeadingCopy = {
    title: string
    questionText: string
    statsKey: string // key to use for mobile 'tables'
}[]

//todo: SavingsCard can be merged into 1 component together with Savings
export const SavingsCard = ({ account }: { account: string }): JSX.Element => {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
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

    const headings: HeadingCopy = useMemo(
        () => [
            {
                title: i18n._(t`TYPE`),
                questionText: i18n._(t``),
                statsKey: '',
            },
            {
                title: i18n._(t`TOKEN`),
                questionText: i18n._(t`This is the token that is currently being staked.`),
                statsKey: 'token',
            },
            {
                title: i18n._(t`PROTOCOL`),
                questionText: i18n._(t`This is the protocol that the token is staked to.`),
                statsKey: 'protocol',
            },
            {
                title: i18n._(t`NETWORK`),
                questionText: i18n._(t`The network this savings account belongs to`),
                statsKey: 'network',
            },
            {
                title: i18n._(t`DEPOSIT`),
                questionText: i18n._(t`The total of your deposits which accumulates the rewards.`),
                statsKey: 'principle',
            },
            {
                title: `${i18n._(t`CLAIMABLE REWARDS`)}`,
                questionText: i18n._(t`How much tokens your deposits have accumulated so far.`),
                statsKey: 'claimable',
            },
        ],
        [i18n]
    )

    const [MobileCardRow, CardRow] = useMemo<IWeb3SupportedNetworksProps['onItem'][]>(
        () => [
            ({ chain }) => (
                <SavingsCardTableMobile
                    account={account}
                    requiredChain={chain}
                    headings={headings}
                    toggleModal={toggleModal}
                />
            ),
            ({ chain }) => <SavingsCardRow requiredChain={chain} account={account} toggleModal={toggleModal} />,
        ],
        [account, toggleModal, headings]
    )

    return (
        <>
            {type && (
                //TODO: fix when no account connected
                <SavingsModal type={type} onDismiss={toggleModal} isOpen={isModalOpen} requiredChain={chainId} />
            )}
            {isMobile ? (
                <Web3SupportedNetworks onItem={MobileCardRow} />
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
                        <Web3SupportedNetworks onItem={CardRow} />
                    </Table>
                </Card>
            )}
        </>
    )
}
