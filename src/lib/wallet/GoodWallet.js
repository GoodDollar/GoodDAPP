// @flow
import WalletFactory from './WalletFactory'
import type Web3 from 'web3'

export class GoodWallet {
  ready: Promise<Web3>
  wallet: Web3
  account: string

  constructor() {
    this.ready = WalletFactory.create('software')
    this.ready.then(wallet => {
      this.wallet = wallet
      this.account = this.wallet.eth.defaultAccount
    })
  }

  claim() {}
  signMessage() {}

  sendTx() {}

  async sign(toSign: string) {
    return this.wallet.eth.sign(toSign, this.account)
  }
}
export default new GoodWallet()
