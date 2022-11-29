import React from 'react'
import { QuestionHelper } from 'components'
import Title from 'components/gd/Title'
import { LoadingPlaceHolder } from 'theme/components'
import { CellSC } from '../styled'

import { useSavingsStats } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ModalType } from 'components/Savings/SavingsModal'
import { ModalButton } from 'components/Savings/SavingsModal/ModalButton'

import type { HeadingCopy } from 'components/Savings/SavingsCard'

export const SavingsDepositMobile = ({
    headings,
    requiredChain,
    toggleModal,
}: {
    headings: HeadingCopy
    requiredChain: number
    toggleModal: (type?: ModalType) => void
}): JSX.Element => {
    const { stats, error } = useSavingsStats(10)
    const { i18n } = useLingui()

    return (
        <>
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
                                    {error ? (
                                        <LoadingPlaceHolder />
                                    ) : (
                                        stats &&
                                        (() => {
                                            switch (item.statsKey) {
                                                case 'token':
                                                    return <div>{i18n._(t`G$`)}</div>
                                                case 'protocol':
                                                    return <div>{i18n._(t`GoodDollar`)}</div>
                                                case 'apy':
                                                    return <div>{stats?.apy?.toFixed(0)} %</div>
                                                case 'totalStaked':
                                                    return (
                                                        <>
                                                            {stats?.totalStaked?.format({
                                                                useFixedPrecision: true,
                                                                fixedPrecisionDigits: 2,
                                                            })}
                                                        </>
                                                    )
                                                case 'totalRewardsPaid':
                                                    return <>{stats?.totalRewardsPaid?.format()} </>
                                                default:
                                                    return
                                            }
                                        })()
                                    )}
                                </div>
                            </div>
                        )
                )}
                <div className="savingdeposit">
                    <ModalButton
                        type={'deposit'}
                        title={i18n._(t`Deposit G$`)}
                        chain={requiredChain}
                        toggleModal={toggleModal}
                    />
                </div>
            </CellSC>
        </>
    )
}
