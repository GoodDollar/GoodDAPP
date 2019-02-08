// @flow
import type Web3 from 'web3'
import WalletFactory from './WalletFactory'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.json'
import RedemptionABI from '@gooddollar/goodcontracts/build/contracts/RedemptionFunctional.json'
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.json'
import ReserveABI from '@gooddollar/goodcontracts/build/contracts/GoodDollarReserve.json'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'GoodWallet' })

export class GoodWallet {
  ready: Promise<Web3>
  wallet: Web3
  accountsContract: Web3.eth.Contract
  tokenContract: Web3.eth.Contract
  identityContract: Web3.eth.Contract
  claimContract: Web3.eth.Contract
  reserveContract: Web3.eth.Contract
  account: string
  networkId: number
  gasPrice: number

  constructor() {
    this.ready = WalletFactory.create('software')
    this.ready.then(wallet => {
      this.wallet = wallet
      this.account = this.wallet.eth.defaultAccount
      this.networkId = 42
      this.gasPrice = this.wallet.eth.getGasPrice()
      this.identityContract = new this.wallet.eth.Contract(
        IdentityABI.abi,
        IdentityABI.networks[this.networkId].address,
        { from: this.account }
      )
      this.claimContract = new this.wallet.eth.Contract(
        RedemptionABI.abi,
        RedemptionABI.networks[this.networkId].address,
        { from: this.account }
      )
      this.tokenContract = new this.wallet.eth.Contract(
        GoodDollarABI.abi,
        GoodDollarABI.networks[this.networkId].address,
        { from: this.account }
      )
      this.reserveContract = new this.wallet.eth.Contract(ReserveABI.abi, ReserveABI.networks[this.networkId].address, {
        from: this.account
      })
    })
  }

  async claim() {
    await this.ready
    try {
      const gas = await this.claimContract.methods.claimTokens().estimateGas()
      return this.claimContract.methods.claimTokens().send({
        gas,
        gasPrice: await this.gasPrice
      })
    } catch (e) {
      log.info(e)
      return Promise.reject(e)
    }
  }

  async checkEntitlement() {
    await this.ready
    return await this.claimContract.methods.checkEntitlement().call()
  }

  // async balanceChanged(callback: (error: any, event: any) => any) {
  //   await this.ready
  //   let handler = this.tokenContract.events.Transfer({ fromBlock: 'latest', filter: { from: this.account } }, callback)
  //   let handler2 = this.tokenContract.events.Transfer({ fromBlock: 'latest', filter: { to: this.account } }, callback)
  //   return [handler, handler2]
  // }

  async balanceOf() {
    await this.ready
    return this.tokenContract.methods
      .balanceOf(this.account)
      .call()
      .then(b => {
        b = this.wallet.utils.fromWei(b, 'ether')
        return b
      })
  }

  signMessage() {}

  sendTx() {}

  async sign(toSign: string) {
    await this.ready
    return this.wallet.eth.sign(toSign, this.account)
  }

  async isVerified(address: string): Promise<boolean> {
    await this.ready
    const tx: boolean = await this.identityContract.methods.isVerified(address).call()
    return tx
  }

  async isCitizen(): Promise<boolean> {
    await this.ready
    const tx: boolean = await this.identityContract.methods.isVerified(this.account).call()
    return tx
  }
}
export default new GoodWallet()
