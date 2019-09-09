// @flow
import Web3 from 'web3'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import Config from '../../config/config'
import SoftwareWalletProvider from './SoftwareWalletProvider'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  websocketWeb3Provider: string,
  web3Transport: string,
}
export default class WalletFactory {
  static create(walletType: string, walletConf: WalletConfig): Promise<Web3> {
    if (Config.httpWeb3provider) {
      walletConf.websocketWeb3Provider = walletConf.httpWeb3provider =
        walletConf.httpWeb3provider || Config.httpWeb3provider
    }
    switch (walletType) {
      case 'software':
      default: {
        let provider: SoftwareWalletProvider = new SoftwareWalletProvider({
          ...Config.ethereum[ContractsAddress[Config.network].networkId],
          ...walletConf,
        })
        return provider.ready
      }
    }
  }
}
