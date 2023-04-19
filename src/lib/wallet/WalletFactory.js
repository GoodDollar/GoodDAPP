// @flow
import Web3 from 'web3'
import Config from '../../config/config'
import SoftwareWalletProvider from './SoftwareWalletProvider'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  httpProviderStrategy: string,
  websocketWeb3Provider: string,
  web3Transport: string,
}

export default class WalletFactory {
  static create(walletConf: WalletConfig): Promise<Web3> {
    const { httpProviderStrategy, networkId, ethereum } = Config
    const { network_id: netId, ...conf } = walletConf

    const provider: SoftwareWalletProvider = new SoftwareWalletProvider({
      ...ethereum[netId || networkId],
      httpProviderStrategy,
      ...conf,
    })

    return provider.ready
  }
}
