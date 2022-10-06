import React from 'react'

import Title from 'components/gd/Title'
import { QuestionHelper } from 'components'
import { LoadingPlaceHolder } from 'theme/components'
import { ButtonOutlined } from 'components/gd/Button'
import { CellSC } from '../styled'

import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { useSavingsStats } from '@gooddollar/web3sdk-v2'
import sendGa from 'functions/sendGa'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import { ModalType } from 'components/Savings/SavingsModal'

import type { HeadingCopy } from 'components/Savings/SavingsCard'

export const SavingsDepositMobile = ({
    headings,
    toggleModal,
}: {
    headings: HeadingCopy
    toggleModal: (type?: ModalType) => void
}): JSX.Element => {
    const { stats, error } = useSavingsStats(10)
    const { i18n } = useLingui()
    const getData = sendGa

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
                    <ActionOrSwitchButton
                        size="sm"
                        width="130px"
                        borderRadius="6px"
                        noShadow={true}
                        requireChain={'FUSE'}
                        ButtonEl={ButtonOutlined}
                        onClick={() => {
                            getData({ event: 'savings', action: 'savingsStart' })
                            toggleModal()
                        }}
                    >
                        {' '}
                        Deposit G${' '}
                    </ActionOrSwitchButton>
                </div>
            </CellSC>
        </>
    )
}
