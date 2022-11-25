import { useStakerInfo } from '@gooddollar/web3sdk-v2'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ModalType } from 'components/Savings/SavingsModal'
import { ModalButton } from 'components/Savings/SavingsModal/ModalButton'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'
import { useEffect } from 'react'
import { LoadingPlaceHolder } from 'theme/components'

export const SavingsCardRow = ({
    account,
    requiredChain,
    toggleModal,
}: {
    account: string
    requiredChain: number
    toggleModal: (type?: ModalType) => void
}): JSX.Element => {
    const { i18n } = useLingui()
    const sendData = useSendAnalyticsData()
    const { stats, error } = useStakerInfo(requiredChain, 10, account)

    useEffect(() => {
        if (error) {
            console.error('Unable to fetch staker info:', { error })
        }
    }, [error])

    return (
        <tr>
            <td>{i18n._(t`Savings`)}</td>
            <td>{i18n._(t`G$`)}</td>
            <td>{i18n._(t`GoodDAO`)}</td>
            <td>
                <div className="flex flex-col segment">
                    {stats?.principle ? (
                        <>{stats.principle.format({ useFixedPrecision: true, fixedPrecisionDigits: 2 })}</>
                    ) : (
                        <LoadingPlaceHolder />
                    )}
                </div>
            </td>
            <td>
                <div className="flex flex-col segment">
                    {stats?.claimable ? (
                        <>
                            <div>{stats.claimable.g$Reward.format()}</div>
                            <div>{stats.claimable.goodReward.format()}</div>
                        </>
                    ) : (
                        <div className="flex flex-col">
                            <div style={{ width: '200px', marginBottom: '10px' }} className="flex flex-row">
                                <LoadingPlaceHolder />
                            </div>
                            <div style={{ width: '200px' }}>
                                <LoadingPlaceHolder />
                            </div>
                        </div>
                    )}
                </div>
            </td>
            <td className="flex content-center justify-center">
                <div className="flex items-end justify-center md:flex-col segment withdraw-buttons">
                    <div className="h-full withdraw-button md:h-auto">
                        <ModalButton
                            type={'withdraw'}
                            title={i18n._(t`Withdraw G$`)}
                            chain={requiredChain}
                            toggleModal={toggleModal}
                        />
                        <div className={'mb-1'}></div>
                        <ModalButton
                            type={'claim'}
                            title={i18n._(t`Claim Rewards`)}
                            chain={requiredChain}
                            toggleModal={toggleModal}
                        />
                    </div>
                </div>
            </td>
        </tr>
    )
}
