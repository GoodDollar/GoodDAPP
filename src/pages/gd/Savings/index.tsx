import React, { useCallback, memo, useState, useReducer, useMemo, useEffect } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { DAO_NETWORK, LIQUIDITY_PROTOCOL } from '@gooddollar/web3sdk/dist/constants'
import { useEnvWeb3, useGdContextProvider, ActiveNetworks } from '@gooddollar/web3sdk/dist/hooks'
import { stake, SavingsSDK, useStakerInfo, useTransferAndCall, useWithdrawSavings } from '@gooddollar/web3sdk-v2'
import Modal  from 'components/Modal/'
import { StakeDepositSC } from 'pages/gd/Stake/StakeDeposit/styled'
import { useDispatch } from 'react-redux'
import SwapInput from 'pages/gd/Swap/SwapInput'
import type { Action } from 'pages/gd/Stake/StakeDeposit'
import { addTransaction } from 'state/transactions/actions'
import { G$ } from '@gooddollar/web3sdk/dist/constants/tokens'
import { useTokenBalance } from 'state/wallet/hooks'
import { Token } from '@sushiswap/sdk'
import { PercentInputControlsStyled } from 'components/Withdraw/PercentInputControls/styled'
import PercentInputControls, { PercentInputControlsProps, restrictValue } from 'components/Withdraw/PercentInputControls'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { ButtonAction, ButtonDefault, ButtonText } from 'components/gd/Button'
import sendGa from 'functions/sendGa'
import Title from 'components/gd/Title'
import { utils, ethers, Signer, BigNumber } from 'ethers'
import { SavingsAccount } from './SavingsAccount'


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

type DepositState = 'none' | 'pending' | 'send' | 'success'

interface StakerInfo {
  deposit: BigNumber,
  shares: BigNumber,
  rewardsPaid: BigNumber, 
  rewardsDonated: BigNumber,
  avgDonationRatio: BigNumber
}


// TODO: SDK-v2 hooks don't work properly when savings is loaded as first page
const Savings = () => {
// export default function Savings(): JSX.Element {
  const { chainId, account } = useActiveWeb3React()
  const { activeNetwork } = useGdContextProvider()
  const { i18n } = useLingui()
  const [isOpen, setIsOpen] = useState(false) 
  console.log('savings render') 

  const [percentage, setPercentage] = useState<string>('50')
  const [status, setStatus] = useState<DepositState>('none')
  const getData = sendGa

  const transferAndCall = useTransferAndCall(activeNetwork)
  const withdrawSavings = useWithdrawSavings(activeNetwork)
  
  const deposit = async (amount:string, donation:string) => {
    console.log('start saving b4 account')
    if (account) {
      console.log('test')
      const txReceipt = transferAndCall.transfer(amount, parseInt(donation)).then((res) => {
        console.log('res transfer -->', {res})
        return res
      })
      console.log('startSaving -->', {txReceipt})
      return
    }
  }

  const withdraw = async (amount:string) => {
    if (account) {
      const txReceipt = withdrawSavings.withdraw(amount).then((res) => {
        console.log('response withdraw -->', {res})
        return res
      }) 
    }
  }   

  // TODO: specify towards savings save flow
  const [state, dispatch] = useReducer(
    (
        state: typeof initialState,
        action:
            | Action<'TOGGLE_TOKEN', boolean>
            | Action<'TOGGLE_LOADING'>
            | Action<'CHANGE_VALUE', string>
            | Action<'CHANGE_SIGNED'>
            | Action<'SET_ERROR', Error>
            | Action<'DONE', string>
    ) => {
        switch (action.type) {
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
            case 'CHANGE_SIGNED':
                return {
                    ...state,
                    signed: true
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

  // useEffect(() => {
  //   // console.log('savings -- state -->', {newState})
  // }, [newState])

  // const withLoading = async (cb: Function) => {
  //   try {
  //       dispatch({ type: 'TOGGLE_LOADING' })
  //       await cb()
  //   } catch (e) {
  //       dispatch({
  //           type: 'SET_ERROR',
  //           payload: e as Error
  //       })
  //   } finally {
  //       dispatch({ type: 'TOGGLE_LOADING' })
  //   }
  // }
  
  // const reduxDispatch = useDispatch()
  const toggleModal = () => setIsOpen(!isOpen)
  const tokenToDeposit = G$[122]
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
        [tokenToDeposit]
    )
  )

  useEffect(() => {
    console.log('send transaction state -->', {state})
  }, [state])

  return (
    <>
    <Modal isOpen={isOpen} onDismiss={toggleModal}>
        <StakeDepositSC style={{
          // display: 'flex',
          // justifyContent: 'center',
          // flexDirection: 'column'
        }}>
          <Title className="flex items-center justify-center mb-2 space-x-2">
            Savings Account
          </Title>
          <div className="flex mb-4 flex-col">
            <span>How much would you like to save</span>
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
              disabled={status === 'pending'}
              type={'savings'}
            />
          </div>
          <div>
            <button style={{
              border: '1px solid blue', 
              borderRadius: '5px',
              padding: '5px',
              marginTop: '10px'
            }} onClick={() => {
              deposit(state.value, percentage)
            }}> Transfer and Call </button>

            <button style={{
              border: '1px solid blue', 
              borderRadius: '5px',
              padding: '5px',
              marginTop: '10px'
            }} onClick={() => {
              withdraw(state.value)
            }}> Withdraw saving </button>
          </div>
        </StakeDepositSC>
      </Modal>

      <p>Savings will be here</p>
      <button style={{
        border: '1px solid blue', 
        borderRadius: '5px',
        padding: '5px',
        marginTop: '10px'
      }}onClick={toggleModal}> Deposit G$ </button>

      <div style={{
        marginTop: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
      {
        account && activeNetwork && (
          <SavingsAccount account={account} network={activeNetwork} />
        )
      }
      </div>
    </>
  )
}

export default memo(Savings)


  // let savingsSdk: any;
  // const sdk = useMemo(() => {
  //   if (library){
  //     return new SavingsSDK(library, activeNetwork)
  //   } else {
  //     const rpc = roUrls[activeNetwork as ActiveNetworks]
  //     return new SavingsSDK(new ethers.providers.JsonRpcProvider(rpc), activeNetwork)  
  //   }
  // }, [library, activeNetwork])
  // console.log('Savings (UI) -- library / chainId / account', {library, chainId, account})


          // <button style={{
          //           border: '1px solid blue', 
          //           borderRadius: '5px',
          //           padding: '5px',
          //           marginTop: '10px'
          // }} onClick={startStake}> Start saving </button>