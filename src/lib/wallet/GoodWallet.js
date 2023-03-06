import Config from '../../config/config'
import { GoodWallet } from './WalletClassSelector'

// import { GoodWallet } from './GoodWalletClass'

const wallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
  network: Config.network,
})
global.wallet = wallet
export default wallet
