import React, { useMemo } from 'react'
import useENSName from '../../hooks/useENSName'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import Loader from '../Loader'
import WalletModal from '../WalletModal'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'
import useSendAnalyticsData from '../../hooks/useSendAnalyticsData'
import { Text, HStack } from 'native-base'
import { useNativeBalance } from '@gooddollar/web3sdk-v2'
import { Currency } from '@sushiswap/sdk'

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime
}

function Web3StatusInner() {
    const { i18n } = useLingui()
    const sendData = useSendAnalyticsData()
    const { account, chainId } = useActiveWeb3React()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()
    const nativeBalance = useNativeBalance()

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions)
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

    const hasPendingTransactions = !!pending.length

    const onAccountClick = () => {
        sendData({ event: 'goto_page', action: 'goto_address' })
    }

    return (
        <HStack space={8} flexDirection="row">
            {account && (
                <div className="flex flex-row gap-4">
                    {nativeBalance && (
                        <Text fontSize="sm" fontFamily="subheading" fontWeight="normal" color="primary">
                            {parseFloat(nativeBalance).toFixed(4)} {Currency.getNativeCurrencySymbol(chainId)}
                        </Text>
                    )}
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
                </div>
            )}
        </HStack>
    )
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
