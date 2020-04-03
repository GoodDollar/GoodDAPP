import Config from '../../config/config'
import { GoodWallet } from './GoodWalletClass'
import './PaymentLinks'
export default new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
