import React, { useCallback, useState, useEffect, FC, useMemo } from 'react'
import Table from 'components/gd/Table'
import Title from 'components/gd/Title'
import { QuestionHelper } from 'components'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useSavingsStats, SupportedV2Networks, useG$Tokens } from '@gooddollar/web3sdk-v2'
import SavingsModal from 'components/Savings/SavingsModal'
import { Wrapper } from '../styled'
import styled from 'styled-components'
import AsyncTokenIcon from 'components/gd/sushi/AsyncTokenIcon'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { useWindowSize } from 'hooks/useWindowSize'
import { SavingsDepositMobile } from './SavingsDepositMobile'
import { SavingsMobileStat } from '../../../../components/Savings/SavingsStat/SavingsMobileStat'
import { HeadingCopy } from 'components/Savings/SavingsCard'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { ModalButton } from 'components/Savings/SavingsModal/SavingsModalButtons'
import { ChainId } from '@sushiswap/sdk'
import Web3SupportedNetworks, { IWeb3SupportedNetworksProps } from 'components/Web3SupportedNetworks'

const SavingsDeposit = styled.div`
    margin-top: 10px;
`

interface SavingRowProps {
    chainId: ChainId
    headings: HeadingCopy
    showModal: (chain: ChainId) => void
}

const SavingRow: FC<SavingRowProps> = ({ chainId, headings, showModal }) => {
    const { stats, error } = useSavingsStats(chainId, 10)
    const [G$] = useG$Tokens()
    const { i18n } = useLingui()

    const onModalButtonPress = useCallback(() => showModal(chainId), [chainId, showModal])

    useEffect(() => {
        if (error) {
            console.error('Unable to fetch global stats:', { error })
        }
    }, [error])

    return (
        <>
            <tr>
                <td>
                    <AsyncTokenIcon
                        address={G$.address}
                        chainId={G$.chainId}
                        className={'block w-5 h-5 mr-2 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12'}
                    />
                </td>

                {headings.map((item, index) => (
                    <td key={index}>
                        <SavingsMobileStat
                            stats={stats}
                            statsKey={item.statsKey}
                            requiredChain={chainId}
                            statsError={error}
                        />
                    </td>
                ))}

                <td>
                    <ModalButton
                        type={'deposit'}
                        title={i18n._(t`Deposit G$`)}
                        chain={chainId}
                        toggleModal={onModalButtonPress}
                    />
                </td>
            </tr>
        </>
    )
}

//todo: Savings can be merged into 1 component together with SavingsCard

export const Savings: FC = () => {
    const [modalData, setModalData] = useState<ChainId>()
    const { account, chainId } = useActiveWeb3React()
    const { i18n } = useLingui()
    const { width } = useWindowSize()
    const isMobile = width ? width <= 768 : undefined
    const sendData = useSendAnalyticsData()

    const showModal = useCallback(
        (chain: ChainId) => {
            setModalData(chain)
        },
        [sendData, setModalData]
    )

    const hideModal = useCallback(() => {
        setModalData(undefined)
    }, [sendData, setModalData])

    const headings: HeadingCopy = useMemo(
        () => [
            {
                title: i18n._(t`Token`),
                questionText: i18n._(t`This is the token that you can deposit into the savings contract.`),
                statsKey: 'token',
            },
            {
                title: i18n._(t`Protocol`),
                questionText: i18n._(t`Your current savings balance.`),
                statsKey: 'protocol',
            },
            {
                title: i18n._(t`Network`),
                questionText: i18n._(t`Your current network.`),
                statsKey: 'network',
            },
            {
                title: i18n._(t`Fixed Apy`),
                questionText: i18n._(t`The fixed annual interest.`),
                statsKey: 'apy',
            },
            {
                title: i18n._(t`Total Staked`),
                questionText: i18n._(t`Total currently saved.`),
                statsKey: 'totalStaked',
            },
            {
                title: i18n._(t`Total Rewards Paid`),
                questionText: i18n._(t`Total rewards claimed.`),
                statsKey: 'totalRewardsPaid',
            },
        ],
        [i18n]
    )

    const [MobileRow, Row] = useMemo<IWeb3SupportedNetworksProps['onItem'][]>(
        () => [
            ({ chain }) => <SavingsDepositMobile requiredChain={chain} headings={headings} showModal={showModal} />,
            ({ chain }) => <SavingRow chainId={chain} headings={headings} showModal={showModal} />,
        ],
        [headings, showModal]
    )

    return (
        <SavingsDeposit>
            <div className="mt-12"></div>
            {Object.values(SupportedV2Networks).includes(chainId as number) && account && !!modalData && (
                <SavingsModal type="deposit" onDismiss={hideModal} isOpen={!!modalData} requiredChain={modalData} />
            )}
            <Title className={`md:pl-4`}>{i18n._(t`Savings`)}</Title>
            <div className="mt-4"></div>

            {isMobile ? (
                <Web3SupportedNetworks onItem={MobileRow} />
            ) : (
                <Wrapper>
                    <Table
                        header={
                            <tr>
                                <th>{/* icon */}</th>
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
                        <Web3SupportedNetworks onItem={Row} />
                    </Table>
                </Wrapper>
            )}
        </SavingsDeposit>
    )
}
