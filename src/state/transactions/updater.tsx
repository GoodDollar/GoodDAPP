import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import { checkedTransaction, finalizeTransaction } from './actions'
import { utils, FixedNumber } from 'ethers'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

export function shouldCheck(
    lastBlockNumber: number,
    tx: { addedTime: number; receipt?: {}; lastCheckedBlockNumber?: number }
): boolean {
    if (tx.receipt) return false
    if (!tx.lastCheckedBlockNumber) return true
    const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
    if (blocksSinceCheck < 1) return false
    const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
    if (minutesPending > 60) {
        // every 10 blocks if pending for longer than an hour
        return blocksSinceCheck > 9
    } else if (minutesPending > 5) {
        // every 3 blocks if pending more than 5 minutes
        return blocksSinceCheck > 2
    } else {
        // otherwise every block
        return true
    }
}

export default function Updater(): null {
    const { i18n } = useLingui()
    const { chainId, library } = useActiveWeb3React()

    const lastBlockNumber = useBlockNumber()

    const dispatch = useDispatch<AppDispatch>()
    const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

    const transactions = chainId ? state[chainId] ?? {} : {}

    // show popup on confirm
    const addPopup = useAddPopup()

    useEffect(() => {
        if (!chainId || !library || !lastBlockNumber) return
        Object.keys(transactions)
            .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
            .forEach(hash => {
                library
                    .getTransactionReceipt(hash)
                    .then(receipt => {
                      let confirmedSummary = transactions[hash]?.summary
                        if (receipt) {
                          if (transactions[hash]?.tradeInfo) {
                            const receiptData = receipt.logs[receipt.logs.length - 1].data
                            const txInput = transactions[hash]?.tradeInfo?.input
                            const txOutput = transactions[hash]?.tradeInfo?.output

                            let decoded 
                            const buying = txInput?.symbol !== 'G$'
                            if (buying){
                              // Buying G$
                              decoded = utils.defaultAbiCoder.decode(['uint256', 'uint256'], receiptData)
                            } else {
                              // Selling G$
                              decoded = utils.defaultAbiCoder.decode(['uint256', 'uint256', 'uint256'], receiptData)
                            }

                            const format = FixedNumber.fromString(utils.formatUnits(
                              decoded[buying ? 0 : 2], buying ? txInput?.decimals : txOutput?.decimals)).round(5).toString()

                            const commify = utils.commify(utils.formatUnits(
                              decoded[buying ? 1 : 0], buying ? txOutput?.decimals : txInput?.decimals))

                            confirmedSummary = i18n._(t`Swapped  ${buying ? format : commify} ${txInput?.symbol}
                                                        to ${buying ? commify : format} ${txOutput?.symbol}`) 
                          }
                          dispatch(
                              finalizeTransaction({
                                  chainId,
                                  hash,
                                  receipt: {
                                      blockHash: receipt.blockHash,
                                      blockNumber: receipt.blockNumber,
                                      contractAddress: receipt.contractAddress,
                                      from: receipt.from,
                                      status: receipt.status,
                                      to: receipt.to,
                                      transactionHash: receipt.transactionHash,
                                      transactionIndex: receipt.transactionIndex
                                  },
                                  summary: confirmedSummary 
                              })
                          )

                          addPopup(
                              {
                                  txn: {
                                      hash,
                                      success: receipt.status === 1,
                                      summary: confirmedSummary
                                  }
                              },
                              hash
                          )
                        } else {
                            dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
                        }
                    })
                    .catch(error => {
                        console.error(`failed to check transaction hash: ${hash}`, error)
                    })
            })
    }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup])

    return null
}
