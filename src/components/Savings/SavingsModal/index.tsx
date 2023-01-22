import React, { useState, useReducer, useEffect, memo, useCallback, useMemo } from 'react'

import Modal from 'components/Modal/'
import { StakeDepositSC } from 'pages/gd/Stake/StakeDeposit/styled'
import Title from 'components/gd/Title'
import SwapInput from 'pages/gd/Swap/SwapInput'
import PercentInputControls from 'components/Withdraw/PercentInputControls'

import { useDispatch } from 'react-redux'
import type { Action } from 'pages/gd/Stake/StakeDeposit'
import { addTransaction } from 'state/transactions/actions'

import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

import Loader from 'components/Loader'
import { ButtonAction } from 'components/gd/Button'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useSavingsBalance, useSavingsFunctions, SupportedV2Networks } from '@gooddollar/web3sdk-v2'
import { TransactionReceipt } from '@ethersproject/providers'
import { TransactionStatus } from '@usedapp/core'
import useSendAnalyticsData from 'hooks/useSendAnalyticsData'

// TODO: Change to savings specific state
const initialState = {
    token: 'A' as 'A' | 'B',
    value: '',
    dollarEquivalent: undefined as undefined | string,
    approved: false,
    signed: false,
    loading: false,
    error: undefined as undefined | string,
    done: false,
    transactionHash: undefined as undefined | string,
}

const TransactionCopy = {
    deposit: {
        title: {
            init: 'Deposit to Savings Account',
            loading: 'Depositing. . .',
            done: 'Well Done!',
        },
        action: 'Deposit to',
        transaction: {
            summary: 'G$ deposited to savings',
        },
    },
    withdraw: {
        title: {
            init: 'Withdraw from Savings account',
            loading: 'Withdrawing. . .',
            done: 'Success',
        },
        transaction: {
            summary: 'G$ withdrawn from savings',
        },
    },
    claim: {
        title: {
            init: 'Claim Rewards',
            loading: 'Claiming. . .',
            done: 'Success',
        },
        transaction: {
            summary: 'Claimed savings rewards',
        },
    },
}

export type ModalType = 'deposit' | 'withdraw' | 'claim'
export interface ModalStatus {
    type: ModalType | undefined
    isOpen: boolean
}

const SavingsModal = memo(
    ({
        type,
        onDismiss,
        isOpen,
        requiredChain,
    }: {
        type: ModalType
        onDismiss: () => void
        isOpen: boolean
        requiredChain: number
    }): JSX.Element => {
        const { i18n } = useLingui()
        const { account, chainId } = useActiveWeb3React()
        const network = SupportedV2Networks[chainId]
        const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'None' })
        const reduxDispatch = useDispatch()
        const sendData = useSendAnalyticsData()

        const { g$Balance, savingsBalance } = useSavingsBalance(10, requiredChain)

        const [percentage, setPercentage] = useState<string>('50')

        const { balance, withdrawAmount } = useMemo(() => {
            const balance =
                type === 'withdraw'
                    ? savingsBalance?.format({ useFixedPrecision: true })
                    : g$Balance?.format({ useFixedPrecision: true })

            const withdrawBalance = savingsBalance?.format({
                thousandSeparator: '',
                useFixedPrecision: false,
                suffix: undefined,
            })

            const withdrawAmount = withdrawBalance ? parseFloat(withdrawBalance) * (Number(percentage) / 100) : 0

            return { balance, withdrawAmount }
        }, [g$Balance, savingsBalance, type, percentage])

        const { transfer, withdraw, claim, transferState, withdrawState, claimState } = useSavingsFunctions()

        const addSavingsTransaction = async (tx: TransactionReceipt, amount?: string) => {
            // getData({event: 'savings', action: [type]+'Success'})
            dispatch({ type: 'DONE', payload: tx.transactionHash })
            reduxDispatch(
                addTransaction({
                    chainId: chainId,
                    hash: tx.transactionHash,
                    from: tx.from,
                    summary: i18n._(t`${amount} ${TransactionCopy[type].transaction.summary}`),
                })
            )
        }

        const depositOrWithdraw = async (amount: string) => {
            if (account) {
                sendData({ event: 'savings', action: 'savings_' + type + '_confirm', amount: amount, network })
                const parsedAmount = (parseFloat(withdrawAmount.toFixed(0)) * 1e2).toString()
                const tx =
                    type === 'withdraw'
                        ? await withdraw(parsedAmount)
                        : await transfer((parseFloat(amount) * 1e2).toString())

                if (tx) {
                    sendData({ event: 'savings', action: 'savings_' + type + '_success', amount: amount, network })
                    await addSavingsTransaction(tx, amount)
                    return
                }
            }
        }

        const claimRewards = async () => {
            if (account) {
                sendData({ event: 'savings', action: 'savings_claim_rewards_confirm', network })
                await claim().then((tx) => {
                    if (tx) {
                        sendData({ event: 'savings', action: 'savings_claim_rewards_success', network })
                        void addSavingsTransaction(tx)
                    }
                })
            }
        }

        const withdrawAll = async () => {
            if (account && balance) {
                sendData({ event: 'savings', action: 'savings_withdraw_all_send', network })
                const tx = await withdraw(balance, account)
                if (tx) {
                    sendData({
                        event: 'savings',
                        action: 'savings_withdraw_all_success',
                        amount: balance,
                        network,
                    })
                    void addSavingsTransaction(tx, balance)
                }
            }
        }

        useEffect(() => {
            if (type === 'deposit') {
                setTxStatus(transferState)
            } else if (type === 'withdraw') {
                setTxStatus(withdrawState)
            } else {
                setTxStatus(claimState)
            }
        }, [transferState, withdrawState, claimState, type])

        // TODO: specify towards savings save flow
        const [state, dispatch] = useReducer(
            (
                state: typeof initialState,
                action:
                    | Action<'TOGGLE_INIT'>
                    | Action<'TOGGLE_TOKEN', boolean>
                    | Action<'TOGGLE_LOADING'>
                    | Action<'CHANGE_VALUE', string>
                    | Action<'SET_ERROR', Error>
                    | Action<'DONE', string>
            ) => {
                switch (action.type) {
                    case 'TOGGLE_INIT':
                        return {
                            ...state,
                            error: undefined,
                            loading: false,
                            done: false,
                            signed: false,
                            transactionHash: undefined,
                        }
                    case 'TOGGLE_TOKEN':
                        return {
                            ...state,
                            token: action.payload ? ('B' as const) : ('A' as const),
                        }
                    case 'CHANGE_VALUE':
                        return {
                            ...state,
                            value: action.payload,
                        }
                    case 'TOGGLE_LOADING':
                        return {
                            ...state,
                            error: state.loading ? state.error : undefined,
                            loading: !state.loading,
                        }
                    case 'SET_ERROR':
                        return {
                            ...state,
                            error: action.payload.message,
                        }
                    case 'DONE':
                        return {
                            ...state,
                            done: true,
                            // In case CHANGE_SIGNED is not triggered
                            signed: true,
                            transactionHash: action.payload,
                        }
                }
            },
            initialState
        )

        const withLoading = async (cb: () => Promise<void>) => {
            try {
                dispatch({ type: 'TOGGLE_LOADING' })
                await cb()
            } catch (e) {
                console.log('toggle loading error', { e })
                dispatch({
                    type: 'SET_ERROR',
                    payload: e as Error,
                })
            } finally {
                dispatch({ type: 'TOGGLE_LOADING' })
            }
        }

        const onConfirmTx = useCallback(() => {
            void withLoading(async () => {
                if (type === 'claim') {
                    await claimRewards()
                } else {
                    percentage === '100' ? await withdrawAll() : await depositOrWithdraw(state.value)
                }
            })
        }, [withLoading, claimRewards, withdrawAll, depositOrWithdraw, state])

        return (
            <Modal
                isOpen={isOpen}
                onDismiss={() => {
                    dispatch({ type: 'TOGGLE_INIT' })
                    onDismiss()
                }}
            >
                <StakeDepositSC>
                    <Title className="flex items-center justify-center mb-2 space-x-2" style={{ fontSize: '24px' }}>
                        {state.loading && !state.done
                            ? i18n._(t`${TransactionCopy[type].title.loading}`)
                            : state.done
                            ? i18n._(t`${TransactionCopy[type].title.done}`)
                            : i18n._(t`${TransactionCopy[type].title.init}`)}
                    </Title>
                    {txStatus.status === 'Exception' && txStatus.errorMessage && (
                        <div className="flex justify-center mb-2 error">{txStatus.errorMessage}</div>
                    )}
                    {state.loading && !state.done ? (
                        <div id="LoadingScreen" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Loader stroke="#173046" size="32px" />
                        </div>
                    ) : state.done ? (
                        <div id="SuccessScreen" className="text-center">
                            {i18n._(t`Your ${type} transaction has been confirmed!`)}
                        </div>
                    ) : (
                        <div>
                            {type !== 'claim' && (
                                <div className="flex flex-col mb-4">
                                    {type === 'deposit' ? (
                                        <>
                                            <span>How much would you like to {type}</span>
                                            <SwapInput
                                                balance={balance}
                                                autoMax
                                                disabled={state.loading}
                                                value={state.value}
                                                onMax={() => {
                                                    dispatch({
                                                        type: 'CHANGE_VALUE',
                                                        payload: balance ?? '0', //todo: format balances
                                                    })
                                                }}
                                                onChange={(e) =>
                                                    dispatch({
                                                        type: 'CHANGE_VALUE',
                                                        payload: e.currentTarget.value,
                                                    })
                                                }
                                            />
                                        </>
                                    ) : (
                                        <PercentInputControls value={percentage} onPercentChange={setPercentage} />
                                    )}
                                </div>
                            )}
                            <div className="flex flex-row">
                                <ButtonAction
                                    className={'claim-reward'}
                                    style={{
                                        borderRadius: '5px',
                                        padding: '5px',
                                        marginTop: '10px',
                                    }}
                                    onClick={onConfirmTx}
                                >
                                    {type} {type === 'withdraw' ? withdrawAmount + ' G$ ' : ''}
                                </ButtonAction>
                            </div>
                        </div>
                    )}
                </StakeDepositSC>
            </Modal>
        )
    }
)

export default SavingsModal
