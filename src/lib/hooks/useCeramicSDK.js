import { useEffect, useState } from 'react'
import { CeramicSDK } from '@gooddollar/ceramic-seed-sdk'
import Web3 from 'web3'
import config from '../../config/config'
import AsyncStorage from '../../lib/utils/asyncStorage'

const useCeramicSDK = () => {
  const [initialized, setInitialized] = useState(false)
  const [ceramicSdk, setCeramicSdk] = useState({})

  useEffect(() => {
    const test = async () => {
      const sdk = new CeramicSDK(config.ceramicSdkUrl)

      const pkey = await AsyncStorage.getItem('GD_masterSeed')
      const web3 = new Web3()

      const mainAccount = web3.eth.accounts.privateKeyToAccount(pkey)

      // const mainAccount = web3.eth.accounts.create()
      await sdk.initialize(mainAccount.privateKey.slice(2), mainAccount.address, 'main') //we expect sdk to have already been initialized in the past, so provider label doesnt matter here
      setCeramicSdk(sdk)
      setInitialized(true)
    }
    test()
  }, [])
  return [ceramicSdk, initialized]
}

export default useCeramicSDK
