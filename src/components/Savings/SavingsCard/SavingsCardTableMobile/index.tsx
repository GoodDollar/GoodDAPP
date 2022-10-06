import React from 'react'
import { CellSC } from 'pages/gd/Portfolio/styled'
import Card from 'components/gd/Card'
import Title from 'components/gd/Title'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ModalType } from 'components/Savings/SavingsModal'
import { QuestionHelper } from 'components'
import type { HeadingCopy } from '..'
import { useStakerInfo, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import { LoadingPlaceHolder } from 'theme/components'
import { ActionOrSwitchButton } from 'components/gd/Button/ActionOrSwitchButton'
import sendGa from 'functions/sendGa'

export const SavingsCardTableMobile = ({
    account,
    hasBalance,
    headings,
    toggleModal,
}: {
    account: string
    hasBalance: boolean | undefined
    headings: HeadingCopy
    toggleModal: (type?: ModalType) => void
}): JSX.Element => {
    const { i18n } = useLingui()
    const { stats, error } = useStakerInfo(10, account)
    const getData = sendGa

    return (
        <Card className="mb-6 md:mb-4 card">
            <CellSC className="h-72">
                <div className="flex flex-row flex-wrap items-center justify-start max-w-xs gap-x-16 gap-y-4">
                    {headings.map(
                        (item, index) =>
                            index !== 0 && ( // skip type header on mobile, in line with stake positions
                                <div key={index}>
                                    <div className="flex flex-grow-1">
                                        <Title type="category" className="flex items-center">
                                            {item.title} <QuestionHelper text={item.questionText || ''} />
                                        </Title>
                                    </div>
                                    <div className="font-bold value">
                                        {error ? (
                                            <LoadingPlaceHolder />
                                        ) : (
                                            stats &&
                                            hasBalance &&
                                            (() => {
                                                switch (item.statsKey) {
                                                    case 'token':
                                                        return <div>{i18n._(t`G$`)}</div>
                                                    case 'protocol':
                                                        return <div>{i18n._(t`GoodDAO`)}</div>
                                                    case 'principle':
                                                        return (
                                                            <div>
                                                                {stats?.[item.statsKey]?.format({
                                                                    useFixedPrecision: true,
                                                                    fixedPrecisionDigits: 2,
                                                                })}
                                                            </div>
                                                        )
                                                    case 'claimable':
                                                        return (
                                                            <>
                                                                <div>{stats?.[item.statsKey]?.g$Reward.format()}</div>
                                                                <div>{stats?.[item.statsKey]?.goodReward.format()}</div>
                                                            </>
                                                        )
                                                    default:
                                                        return
                                                }
                                            })()
                                        )}
                                    </div>
                                </div>
                            )
                    )}
                    {hasBalance && (
                        <div className="flex items-end justify-center md:flex-col segment withdraw-buttons">
                            <div className="flex flex-col justify-center h-full w-72 withdraw-button md:h-auto">
                                <ActionOrSwitchButton
                                    width="130px"
                                    size="m"
                                    borderRadius="6px"
                                    requireChain={'FUSE'}
                                    noShadow={true}
                                    onClick={() => {
                                        getData({ event: 'savings', action: 'startWithdraw' })
                                        toggleModal('withdraw')
                                    }}
                                >
                                    {' '}
                                    {i18n._(t`Withdraw G$`)}{' '}
                                </ActionOrSwitchButton>
                                <div className={'mb-1 mr-1'}></div>
                                <ActionOrSwitchButton
                                    width="130px"
                                    size="m"
                                    noShadow={true}
                                    borderRadius="6px"
                                    requireChain={'FUSE'}
                                    onClick={() => {
                                        getData({ event: 'savings', action: 'startClaim' })
                                        toggleModal('claim')
                                    }}
                                >
                                    {' '}
                                    {i18n._(t`Claim Rewards`)}{' '}
                                </ActionOrSwitchButton>
                            </div>
                        </div>
                    )}
                </div>
            </CellSC>
        </Card>
    )
}
