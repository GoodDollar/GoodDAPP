import Config from '../../config/config'
import { GoodWallet } from './WalletClassSelector'

// import { GoodWallet } from './GoodWalletClass'

const wallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
global.wallet = wallet
export default wallet
