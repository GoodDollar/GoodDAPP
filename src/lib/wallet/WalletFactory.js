// @flow
import Web3 from 'web3'
import Config from '../../config/config'
import SoftwareWalletProvider from './SoftwareWalletProvider'
import ThirdPartyWalletProvider from './thirdparty/ThirdPartyWalletProvider'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  websocketWeb3Provider: string,
  web3Transport: string,
  type: 'SEED' | 'WEB3WALLET',
}
const networkToId = network => {
  switch (network) {
    case 'ethereum':
      return '1'
    case 'fuse':
    case 'staging':
    case 'production':
      return '122'
    default:
      return '4447'
  }
}

export default class WalletFactory {
  static create(walletConf: WalletConfig): Promise<Web3> {
    if (Config.httpWeb3provider) {
      walletConf.websocketWeb3Provider = walletConf.httpWeb3provider =
        walletConf.httpWeb3provider || Config.httpWeb3provider
    }
    if (!walletConf.httpWeb3provider) {
      delete walletConf.httpWeb3provider
    }

    switch (walletConf.type) {
      default:
      case 'SEED': {
        return new SoftwareWalletProvider({
          ...Config.ethereum[networkToId(Config.network)],
          ...walletConf,
        }).ready
      }
      case 'WEB3WALLET':
        return new ThirdPartyWalletProvider({
          ...Config.ethereum[networkToId(Config.network)],
          ...walletConf,
        }).ready
    }
  }
}
