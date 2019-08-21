import Config from '../../config/config'
import { GoodWallet } from './GoodWalletClass'

export default new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
