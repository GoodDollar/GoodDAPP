import { useEffect, useState } from 'react'
import { CeramicSDK } from '@gooddollar/ceramic-seed-sdk'
import Web3 from 'web3'
import config from '../../config/config'
import AsyncStorage from '../../lib/utils/asyncStorage'
import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'useCeramicSDK' })

const useCeramicSDK = () => {
  const [initialized, setInitialized] = useState(false)
  const [ceramicSdk, setCeramicSdk] = useState({})
  const [mainAccount, setAccount] = useState()

  useEffect(() => {
    const test = async () => {
      const sdk = new CeramicSDK(config.cermaicNodeUrl)

      const pkey = await AsyncStorage.getItem('GD_masterSeed')
      const web3 = new Web3()

      const mainAccount = web3.eth.accounts.privateKeyToAccount(pkey)

      // const mainAccount = web3.eth.accounts.create()
      log.debug('initializing ceramic:', mainAccount.address)
      await sdk
        .initialize(mainAccount.privateKey.slice(2), mainAccount.address, 'main3')
        .catch(e => log.error('failed initializing', e, e.message)) //we expect sdk to have already been initialized in the past, so provider label doesnt matter here
      setCeramicSdk(sdk)
      setInitialized(true)
      setAccount(mainAccount.address)
    }
    test()
  }, [])
  return [ceramicSdk, initialized, mainAccount]
}

export default useCeramicSDK
