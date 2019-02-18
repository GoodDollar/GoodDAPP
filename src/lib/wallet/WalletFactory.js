// @flow
import Web3 from 'web3'
import SoftwareWalletProvider from './SoftwareWalletProvider'
import Config from '../../config/config'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  websocketWeb3Provider: string,
  web3Transport: string
}
export default class WalletFactory {
  static create(walletType: string): Promise<Web3> {
    switch (walletType) {
      case 'software':
      default:
        let provider: SoftwareWalletProvider = new SoftwareWalletProvider(Config.ethereum[Config.networkId])
        return provider.ready
    }
  }
}
