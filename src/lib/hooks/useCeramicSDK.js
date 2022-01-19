import { useEffect, useState } from 'react'
import { CeramicSDK } from '@gooddollar/ceramic-seed-sdk'
import Web3 from 'web3'
const sdk = new CeramicSDK('https://ceramic-clay.3boxlabs.com')

const useCeramicSDK = () => {
  const [initialized, setInitialized] = useState(false)
  const [ceramicSdk, setCeramicSdk] = useState({})
  useEffect(() => {
    const privateAccountKey = JSON.parse(localStorage.getItem('GD_masterSeed'))
    const web3 = new Web3()
    const publicAccountKey = web3.eth.accounts.privateKeyToAccount(privateAccountKey)
    sdk.initialize(privateAccountKey, publicAccountKey.address, 'label').then(() => {
      setCeramicSdk(sdk)
      setInitialized(true)
    })
  }, [])
  return [ceramicSdk, initialized]
}

export default useCeramicSDK
