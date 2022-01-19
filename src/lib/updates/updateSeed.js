import { CeramicSDK } from '@gooddollar/ceramic-seed-sdk'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { default as API } from '../API/api'
import wallet from '../wallet/GoodWallet'

import config from '../../config/config'
const fromDate = new Date('2022/01/20')

const upadateWalletSeed = async (lastUpdate, prevVersion, log) => {
  const identifier = wallet.getAccountForType('login')
  const ceramic = new CeramicSDK(config.cermaicNodeUrl)
  const data = await API.userExistsCheck({ identifier })
  const privateAccountKey = await AsyncStorage.getItem('GD_masterSeed')
  const publicAccountKey = wallet.wallet.eth.accounts.privateKeyToAccount(privateAccountKey)
  ceramic.initialize(privateAccountKey, publicAccountKey.address, data.provider)
}

export default { fromDate, update: upadateWalletSeed, key: 'updateWalletSeed' }
