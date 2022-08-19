import React, {useEffect, useState} from 'react'
import { ethers } from 'ethers'
import { SavingsSDK } from '@gooddollar/web3sdk-v2'
import { SavingsCard } from './SavingsCard'

export const SavingsAccount = (
  { account, 
    network}:
  { account:string | null | undefined, 
    network:string}):JSX.Element => {
  const [hasBalance, setHasBalance] = useState<boolean | undefined>(true)

  useEffect(() => {
    if (account){
      const sdk = new SavingsSDK(new ethers.providers.JsonRpcProvider("https://rpc.fuse.io"), 'fuse')
      const checkBalance = sdk.hasBalance(account).then((res) => {
        setHasBalance(res)
      })
    }
  }, [account, setHasBalance])

  return (
    <>
    { account && hasBalance && (
      <SavingsCard account={account} network={network}/>
    )}
    </>
  )
}