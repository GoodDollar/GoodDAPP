import React, { useCallback, memo, useState, useEffect } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useGdContextProvider, ActiveNetworks } from '@gooddollar/web3sdk/dist/hooks'
import { SavingsSDK } from '@gooddollar/web3sdk-v2'
import { ButtonAction, ButtonDefault, ButtonText } from 'components/gd/Button'
import sendGa from 'functions/sendGa'
import { ethers } from 'ethers'
import { SavingsAccount } from './SavingsAccount'
import { SavingsModal } from './SavingsModal'

// note-to-self: SDK-v2 hooks don't work properly when savings is loaded as first page (works now?)
const Savings = () => {
// export default function Savings(): JSX.Element {
  const { account } = useActiveWeb3React()
  const { activeNetwork } = useGdContextProvider()
  const [isOpen, setIsOpen] = useState(false) 
  const [hasBalance, setHasBalance] = useState<boolean | undefined>(true)
  const getData = sendGa

  // console.log('savings render') // todo-fix: re-renders way to many times (in comparison)

  useEffect(() => {
    if (account){
      const sdk = new SavingsSDK(new ethers.providers.JsonRpcProvider("https://rpc.fuse.io"), 'fuse')
      const checkBalance = sdk.hasBalance(account).then((res) => {
        setHasBalance(res)
      })
    }
  }, [account, setHasBalance])

  
  const toggleModal = useCallback(() => setIsOpen(!isOpen), [setIsOpen, isOpen])

  return (
    <>
      <SavingsModal type='deposit' network={activeNetwork} toggle={toggleModal} isOpen={isOpen} />
      <div>
        <p>Savings will be here</p>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center"
        }}>
          <button style={{
            border: '1px solid blue', 
            borderRadius: '5px',
            padding: '5px',
            marginTop: '10px'
          }}onClick={toggleModal}> Deposit G$ </button>
          {/* <button style={{
            border: '1px solid blue', 
            borderRadius: '5px',
            padding: '5px',
            marginTop: '10px'
          }}onClick={toggleClaimModal}> Claim Rewards </button> */}
        </div>

        <div style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}>
        {
          account && activeNetwork && hasBalance && (
            <SavingsAccount account={account} network={activeNetwork} />
          )
        }
        </div>
      </div>
    </>
  )
}

export default memo(Savings)