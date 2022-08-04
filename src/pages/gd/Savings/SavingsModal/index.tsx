import React, { useState, useReducer, useEffect, memo } from 'react'
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

import Loader from 'components/Loader'

// import { useTokenBalance } from 'state/wallet/hooks'
// import { useTokenBalance } from '@usedapp/core'
// import { Token } from '@sushiswap/sdk'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useG$Balance, useSavingsFunctions } from '@gooddollar/web3sdk-v2'
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
      summary: 'G$ deposited to savings',
    }
  },
  withdraw: {
    title: {
      init: 'Withdraw from Savings account',
      loading: 'Withdrawing. . .',
      done: 'Success',
    },
    transaction: {
      summary: 'G$ withdrawn from savings',
    }
  },
  claim: {
    title: {
      init: 'Claim Rewards',
      loading: 'Claiming. . .',
      done: 'Success'
    },
    transaction: {
      summary: 'Claimed savings rewards'
    }
  }
}

export type ModalType = 'deposit' | 'withdraw' | 'claim'

const SavingsModal = (
  {type, network, toggle, isOpen}: 
  {type: ModalType, network: string, toggle: () => void, isOpen: boolean}):JSX.Element => {
  const { i18n } = useLingui()
  console.log('savingsmodal render')
  const { chainId, account } = useActiveWeb3React() 
  const [balance, setBalance] = useState<string>('0')
  const [txStatus, setTxStatus] = useState<TransactionStatus>({status: 'None'})
  const reduxDispatch = useDispatch()
  
  const { depositBalance, withdrawBalance } = useG$Balance(10, network)

  useEffect(() => {
      setBalance(type === 'withdraw' ? withdrawBalance : depositBalance)
  }, [depositBalance, withdrawBalance, type])

  const {
    transfer,
    withdraw,
    claim,
    transferState,
    withdrawState,
    claimState
  } = useSavingsFunctions(network)

  const addSavingsTransaction = async (tx: TransactionReceipt, amount?: string) => {
    dispatch({type: 'DONE', payload: tx.transactionHash})
    reduxDispatch(
      addTransaction({
        chainId: 122, // todo: move back to chainId
        hash: tx.transactionHash,
        from: tx.from,
        summary: i18n._(t`${amount} ${TransactionCopy[type].transaction.summary}`)
      })
    )
  }
  
  const depositOrWithdraw = async (amount:string) => {
    if (account) {
      const parsedAmount = (parseFloat(amount) * 1e2).toString()
      const tx = type === 'claim' ? await withdraw(parsedAmount) : await transfer(parsedAmount)
      if (tx){
        addSavingsTransaction(tx, amount)  
        return        
      }
    }
  }

  const claimRewards = async () => {
    if (account) {
      await claim().then((tx) => {
        if (tx) {
          addSavingsTransaction(tx)
        }
      })
    }
  }

  useEffect(() => {
    if (type === 'deposit'){
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
              {type !== 'claim' &&                   
                <div className="flex flex-col mb-4">
                    <span>How much would you like to {type}</span>
                    <SwapInput
                      balance={balance}
                      autoMax
                      disabled={state.loading}
                      value={state.value}
                      onMax={() => {
                        dispatch({
                            type: 'CHANGE_VALUE',
                            payload: balance ?? '0' //todo: format balances
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
              }
              <div>
                <button style={{
                  border: '1px solid blue', 
                  borderRadius: '5px',
                  padding: '5px',
                  marginTop: '10px'
                }} onClick={() => {
                  withLoading(async () => {
                    if (type === 'claim'){
                      await claimRewards()
                    } else {
                      await depositOrWithdraw(state.value)
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

export default memo(SavingsModal)