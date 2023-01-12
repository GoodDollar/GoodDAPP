import React, { useMemo } from 'react'
import styled from 'styled-components'
import useENSName from '../../hooks/useENSName'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import Loader from '../Loader'
import WalletModal from '../WalletModal'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { OnboardConnectButton } from '../BlockNativeOnboard'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime
}

const Web3StatusInnerSC = styled.div`
    background: ${({ theme }) => theme.color.bg1};
    color: ${({ theme }) => theme.color.input};
    box-shadow: ${({ theme }) => theme.shadow.settings};
    border-radius: 3px;
`

function Web3StatusInner() {
    const { i18n } = useLingui()
    const { account } = useActiveWeb3React()
    const sendData = useSendAnalyticsData()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions)
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

    const hasPendingTransactions = !!pending.length

    const toggleWalletModal = useWalletModalToggle()

    const onAccountClick = () => {
        sendData({ event: 'goto_page', action: 'goto_address' })
    }

    if (account) {
        return (
            <div className="flex flex-row">
                <Web3StatusInnerSC
                    id="web3-status-connected"
                    className="flex items-center px-3 py-2 ml-2 rounded-lg"
                    onClick={toggleWalletModal}
                >
                    {hasPendingTransactions ? (
                        <div className="flex items-center justify-between">
                            <div className="pr-2">
                                {pending?.length} {i18n._(t`Pending`)}
                            </div>{' '}
                            <Loader stroke="#173046" />
                        </div>
                    ) : (
                        <div className="mr-2" onClick={onAccountClick}>
                            {ENSName || shortenAddress(account)}
                        </div>
                    )}
                </Web3StatusInnerSC>
            </div>
        )
    } else {
        return <OnboardConnectButton />
    }
}

export default function Web3Status(): JSX.Element {
    const { account } = useActiveWeb3React()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions)
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
    const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

    return (
        <>
            <Web3StatusInner />
            <WalletModal
                ENSName={ENSName ?? undefined}
                pendingTransactions={pending}
                confirmedTransactions={confirmed}
            />
        </>
    )
}
