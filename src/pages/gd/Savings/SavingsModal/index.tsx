import React, { useState, useReducer, useMemo, useEffect } from 'react'
import { ethers } from 'ethers'

import Modal from 'components/Modal/'
import { StakeDepositSC } from 'pages/gd/Stake/StakeDeposit/styled'
import Title from 'components/gd/Title'
import SwapInput from 'pages/gd/Swap/SwapInput'

import { useDispatch } from 'react-redux'
import type { Action } from 'pages/gd/Stake/StakeDeposit'
import { addTransaction } from 'state/transactions/actions'

import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'

import PercentInputControls, { PercentInputControlsProps, restrictValue } from 'components/Withdraw/PercentInputControls'
import Loader from 'components/Loader'

import { G$ } from '@gooddollar/web3sdk/dist/constants/tokens'
import { useTokenBalance } from 'state/wallet/hooks'
import { Token } from '@sushiswap/sdk'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTransferAndCall, useWithdrawSavings } from '@gooddollar/web3sdk-v2'
import { TransactionReceipt } from '@ethersproject/providers'
import { TransactionStatus } from '@usedapp/core'

// TODO: Change to savings specific state
const initialState = {
  token: 'A' as 'A' | 'B', // stake.tokens.A or stake.tokens.B,
  value: '',
  dollarEquivalent: undefined as undefined | string,
  approved: false,
  signed: false,
  loading: false,
  error: undefined as undefined | string,
  done: false,
  transactionHash: undefined as undefined | string
}

const TransactionCopy = {
  deposit: {
    title: {
      init: 'Deposit to Savings Account',
      loading: 'Depositing. . .',
      done: 'Well Done!'
    },
    action: 'Deposit to',
    transaction: {
      summary: 'deposited to savings',
    }
  },
  withdraw: {
    title: {
      init: 'Withdraw from Savings account',
      loading: 'Withdrawing. . .',
      done: 'Success',
    },
    transaction: {
      summary: 'withdrawn from savings',
    }
  }
}

type ModalType = 'deposit' | 'withdraw'

export const SavingsModal = (
  {type, network, toggle, isOpen}: 
  {type: ModalType, network: string, toggle: () => void, isOpen: boolean}):JSX.Element => {
  const { i18n } = useLingui()
  const { chainId, account } = useActiveWeb3React()

  const [percentage, setPercentage] = useState<string>('50')
  const [txStatus, setTxStatus] = useState<TransactionStatus>({status: 'None'})
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
  const reduxDispatch = useDispatch()

  const {transfer, state: transferStatus} = useTransferAndCall(network)
  const {withdraw, state: withdrawStatus} = useWithdrawSavings(network)

  const addSavingsTransaction = async (tx: TransactionReceipt, amount: string) => {
    dispatch({type: 'DONE', payload: tx.transactionHash})
    reduxDispatch(
      addTransaction({
        chainId: chainId,
        hash: tx.transactionHash,
        from: tx.from,
        summary: i18n._(t`${amount}G$ ${TransactionCopy[type].transaction.summary}`)
      })
    )
  }
  
  const deposit = async (amount:string, donation:string) => {
    if (account) {
      const encDonation = ethers.utils.defaultAbiCoder.encode(["uint32"], [parseInt(donation)])
      const depositAmount = (parseFloat(amount) * 1e2).toString()
      await transfer(depositAmount, encDonation).then((tx) => {
        if (tx){
          addSavingsTransaction(tx, amount)  
          return        
        } else {
          return
        }
      })
      return
    }
  }

  const withdrawSavings = async (amount:string) => {
    if (account) {
      const withdrawAmount = (parseFloat(amount) * 1e2).toString()
      await withdraw(withdrawAmount).then((tx) => {
        if (tx){
          addSavingsTransaction(tx, amount)          
        } 
      }) 
    }
  }

  // TODO: change to withdraw rewards
  // const claimRewards = useClaimRewards(activeNetwork)

  // const claim = async () => {
  //   if (account) {
  //     const txReceipt = claimRewards.claim().then((res) => {
  //       console.log('response claim -->', {res})
  //       return res
  //     })
  //   }
  // }

  // TODO: add get/use withdraw balance
  // useEffect(() => {
  //   if (!error && stats){
  //     setWithdrawBalance(parseInt(stats.principle) * (Number(percentage) / 100))
  //   }
  // }, [stats, percentage, error])

  useEffect(() => {
    if (type === 'deposit'){
      setTxStatus(transferStatus)
    } else {
      setTxStatus(withdrawStatus)
    }

  }, [transferStatus, withdrawStatus, type])

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
                  transactionHash: undefined
              }
            case 'TOGGLE_TOKEN':
                return {
                    ...state,
                    token: action.payload ? ('B' as const) : ('A' as const)
                }
            case 'CHANGE_VALUE':
                return {
                    ...state,
                    value: action.payload
                }
            case 'TOGGLE_LOADING':
                return {
                    ...state,
                    error: state.loading ? state.error : undefined,
                    loading: !state.loading
                }
            case 'SET_ERROR':
                return {
                    ...state,
                    error: action.payload.message
                }
            case 'DONE':
                return {
                    ...state,
                    done: true,
                    // In case CHANGE_SIGNED is not triggered
                    signed: true,
                    transactionHash: action.payload
                }
        }
    },
    initialState
  )

  const withLoading = async (cb: Function) => {
    try {
        dispatch({ type: 'TOGGLE_LOADING' })
        await cb()
    } catch (e) {
      console.log('toggle loading error', {e})
      dispatch({
          type: 'SET_ERROR',
          payload: e as Error
      })
    } finally {
      dispatch({ type: 'TOGGLE_LOADING' })
    }
  }

  const tokenToDeposit = G$[122]
  //TODO: Create useSavingsBalance
  const tokenToDepositBalance = useTokenBalance(
    account,
    useMemo(
        () =>
            chainId &&
            new Token(
                chainId,
                tokenToDeposit.address,
                tokenToDeposit.decimals,
                tokenToDeposit.symbol,
                tokenToDeposit.name
            ),
        [tokenToDeposit, chainId]
    )
  )

  return (
    <Modal isOpen={isOpen} onDismiss={() => {
      dispatch({ type: 'TOGGLE_INIT' })
      toggle()
      }}>
        <StakeDepositSC style={{
          // display: 'flex',
          // justifyContent: 'center',
          // flexDirection: 'column'
        }}>
          <Title className="flex items-center justify-center mb-2 space-x-2" style={{fontSize: '24px'}}>
            { state.loading && !state.done ? i18n._(t`${TransactionCopy[type].title.loading}`) :
              state.done ? i18n._(t`${TransactionCopy[type].title.done}`) :
              i18n._(t`${TransactionCopy[type].title.init}`)
            }
          </Title>
            {
              txStatus.status === 'Exception' && txStatus.errorMessage && (
                <div className='mb-2 error flex justify-center'>{txStatus.errorMessage}</div>
              )
            }
          {
            state.loading && !state.done ? 
            (
              <div id="LoadingScreen" style={{display: 'flex', justifyContent: 'center'}}>
                <Loader stroke="#173046" size="32px" />
              </div>
            ) : state.done ? (
              <div id="SuccessScreen">
                {i18n._(t`Your ${type} transaction has been confirmed!`)}
              </div>
            ) :
            <div>
              <div className="flex flex-col mb-4">
                <span>How much would you like to {type}</span>
                <SwapInput
                  balance={tokenToDepositBalance?.toSignificant(6, { groupSeparator: ',' })}
                  autoMax
                  disabled={state.loading}
                  value={state.value}
                  onMax={() => {
                    dispatch({
                        type: 'CHANGE_VALUE',
                        payload: tokenToDepositBalance?.toExact() ?? '0'
                    })
                  }}
                  onChange={e =>
                    dispatch({
                        type: 'CHANGE_VALUE',
                        payload: e.currentTarget.value
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <PercentInputControls
                  value={percentage}
                  onPercentChange={setPercentage}
                  disabled={txStatus.status === 'PendingSignature'}
                  type={'savingsDeposit'}
                />
              </div>
              <div>
                <button style={{
                  border: '1px solid blue', 
                  borderRadius: '5px',
                  padding: '5px',
                  marginTop: '10px'
                }} onClick={() => {
                  withLoading(async () => {
                    if (type === 'deposit'){
                      await deposit(state.value, percentage)
                      console.log('deposit done or failed')
                    } else {
                      await withdrawSavings(state.value)
                      console.log('withdraw done or failed')
                    }
                  })
                }}> {type} </button>
              </div>
            </div>
          }
        </StakeDepositSC>
      </Modal>
  )
}