import React, { useCallback, useState, useEffect } from 'react'
import Table from 'components/gd/Table'
import Title from 'components/gd/Title'
import { QuestionHelper } from 'components'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useSavingsStats, G$, useGetEnvChainId, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import SavingsModal from 'components/Savings/SavingsModal'
import { Wrapper } from '../styled'
import styled from 'styled-components'
import AsyncTokenIcon from 'components/gd/sushi/AsyncTokenIcon'
import { LoadingPlaceHolder } from 'theme/components'
import sendGa from 'functions/sendGa'
import { useWindowSize } from 'hooks/useWindowSize'
import { SavingsDepositMobile } from './SavingsDepositMobile'
import { HeadingCopy } from 'components/Savings/SavingsCard'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import { ModalButton } from 'components/Savings/SavingsModal/ModalButton'

const SavingsDeposit = styled.div`
    margin-top: 10px;
`

export const Savings = ({ requiredChain }: { requiredChain: number }): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)
    const { account, chainId } = useActiveWeb3React()
    const { stats, error } = useSavingsStats(requiredChain, 10)
    const { i18n } = useLingui()
    const { width } = useWindowSize()
    const isMobile = width ? width <= 768 : undefined
    const { defaultEnv } = useGetEnvChainId()
    const g$ = G$(requiredChain, defaultEnv)

    useEffect(() => {
        if (error) {
            console.error('Unable to fetch global stats:', { error })
        }
    }, [error])

    const toggleModal = useCallback(() => {
        sendGa({ event: 'savings', action: 'savingsStart' })
        setIsOpen((isOpen) => !isOpen)
    }, [setIsOpen])

    const headings: HeadingCopy = [
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
            title: i18n._(t`Fixed Apy`),
            questionText: i18n._(t`The fixed annual interest.`),
            statsKey: 'apy',
        },
        // {
        //   title: i18n._(t`G$'s to withdraw`),
        //   questionText: i18n._(t`How much G$'s you have earned with your savings account`),
        // },
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
    ]
    return (
        <SavingsDeposit>
            <div className="mt-12"></div>
            {Object.values(SupportedV2Networks).includes(chainId as number) && account && (
                <SavingsModal type="deposit" toggle={toggleModal} isOpen={isOpen} requiredChain={requiredChain} />
            )}
            <Title className={`md:pl-4`}>{i18n._(t`Savings`)}</Title>
            <div className="mt-4"></div>
            {isMobile ? (
                <SavingsDepositMobile requiredChain={requiredChain} headings={headings} toggleModal={toggleModal} />
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
                        <tr>
                            <td>
                                <AsyncTokenIcon
                                    address={g$.address}
                                    chainId={g$.chainId}
                                    className={'block w-5 h-5 mr-2 rounded-lg md:w-10 md:h-10 lg:w-12 lg:h-12'}
                                />
                            </td>
                            <td>{i18n._(t`G$`)}</td>
                            <td>{i18n._(t`GoodDollar`)}</td>
                            <td>{error || !stats?.apy ? <LoadingPlaceHolder /> : <>{stats?.apy.toFixed(0)} %</>}</td>
                            <td>
                                {error || !stats?.totalStaked ? (
                                    <LoadingPlaceHolder />
                                ) : (
                                    <>
                                        {' '}
                                        {stats?.totalStaked.format({
                                            useFixedPrecision: true,
                                            fixedPrecisionDigits: 2,
                                        })}
                                    </>
                                )}
                            </td>
                            <td>
                                {error || !stats?.totalRewardsPaid ? (
                                    <LoadingPlaceHolder />
                                ) : (
                                    <>{stats?.totalRewardsPaid.format()} </>
                                )}
                            </td>
                            <td>
                                <ModalButton
                                    type={'deposit'}
                                    title={i18n._(t`Deposit G$`)}
                                    chain={requiredChain}
                                    toggleModal={toggleModal}
                                />
                            </td>
                        </tr>
                    </Table>
                </Wrapper>
            )}
        </SavingsDeposit>
    )
}
