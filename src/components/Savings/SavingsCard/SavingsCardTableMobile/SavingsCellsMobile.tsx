import React from 'react'
// import { Title as TitleNb } from '@gooddollar/good-design'
import { CellSC } from 'pages/gd/Portfolio/styled'
import { CellSC as StakeCellSC } from 'pages/gd/Stake/styled'
import { SavingsMobileStat } from 'components/Savings/SavingsStat/SavingsMobileStat'
import { QuestionHelper } from 'components'
import Title from 'components/gd/Title' //todo: refactor to title variants in good-design
import { SavingsButtons, SavingButtonTypes } from 'components/Savings/SavingsModal/SavingsModalButtons'
import { ModalType } from 'components/Savings/SavingsModal'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import type { HeadingCopy } from '..'
import { SavingsStats, StakerInfo } from '@gooddollar/web3sdk-v2'

type SavingTypes = 'stake' | 'portfolio'

export const SavingsCellsMobile = ({
    headings,
    data,
    chain,
    type,
    toggleModal,
}: {
    headings: HeadingCopy
    data: {
        stats: StakerInfo | SavingsStats | undefined
        error: any[] | undefined
    }
    type: SavingTypes
    chain: number
    toggleModal: (type?: ModalType) => void
}) => {
    const { i18n } = useLingui()

    let buttonTypes: SavingButtonTypes
    switch (type) {
        case 'stake':
            buttonTypes = [
                {
                    id: 'deposit',
                    title: i18n._(t`Deposit G$`),
                },
            ]
            break
        default:
            buttonTypes = [
                {
                    id: 'withdraw',
                    title: i18n._(t`Withdraw G$`),
                },
                {
                    id: 'deposit',
                    title: i18n._(t`Deposit G$`),
                },
            ]
            break
    }

    const styles = {
        cell: 'h-72',
        mainContainer: 'flex flex-row flex-wrap items-center justify-start max-w-xs gap-x-16 gap-y-4',
        buttonContainer: 'flex items-end justify-center md:flex-col segment withdraw-buttons',
        buttonWrapper: 'flex flex-col justify-center h-full w-72 withdraw-button md:h-auto',
        mobileButtons: type === 'stake' ? 'savingdeposit' : 'withdraw',
    }

    const Cell = ({ children }: { children: React.ReactNode }) =>
        type === 'stake' ? <StakeCellSC>{children}</StakeCellSC> : <CellSC className={styles.cell}>{children}</CellSC>

    return (
        <Cell>
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
                                <SavingsMobileStat
                                    statsKey={item.statsKey}
                                    stats={data.stats}
                                    requiredChain={chain}
                                    statsError={data.error}
                                />
                            </div>
                        </div>
                    )
            )}
            <SavingsButtons types={buttonTypes} chain={chain} toggleModal={toggleModal} styles={styles.mobileButtons} />
        </Cell>
    )
}
