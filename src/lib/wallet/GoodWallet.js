// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.json'
import ReserveABI from '@gooddollar/goodcontracts/build/contracts/GoodDollarReserve.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.json'
import OneTimePaymentLinksABI from '@gooddollar/goodcontracts/build/contracts/OneTimePaymentLinks.json'
import RedemptionABI from '@gooddollar/goodcontracts/build/contracts/RedemptionFunctional.json'
import _ from 'lodash'
import type Web3 from 'web3'

import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import WalletFactory from './WalletFactory'

const log = logger.child({ from: 'GoodWallet' })

/**
 * the HDWallet account to use.
 * we use different accounts for different actions in order to preserve privacy and simplify things for user
 * in background
 */
const AccountUsageToPath = {
  gd: 0,
  gundb: 1,
  eth: 2,
  donate: 3
}
export type AccountUsage = $Keys<typeof AccountUsageToPath>
export class GoodWallet {
  ready: Promise<Web3>
  wallet: Web3
  accountsContract: Web3.eth.Contract
  tokenContract: Web3.eth.Contract
  identityContract: Web3.eth.Contract
  claimContract: Web3.eth.Contract
  reserveContract: Web3.eth.Contract
  oneTimePaymentLinksContract: Web3.eth.Contract
  account: string
  accounts: Array<string>
  networkId: number
  gasPrice: number

  constructor() {
    this.init()
  }

  init(): Promise<any> {
    const ready = WalletFactory.create('software')
    this.ready = ready
      .then(wallet => {
        this.wallet = wallet
        this.account = this.wallet.eth.defaultAccount
        this.accounts = this.wallet.eth.accounts.wallet
        this.networkId = Config.networkId
        this.gasPrice = wallet.utils.toWei('1', 'gwei')
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
        this.reserveContract = new this.wallet.eth.Contract(
          ReserveABI.abi,
          ReserveABI.networks[this.networkId].address,
          {
            from: this.account
          }
        )
        this.oneTimePaymentLinksContract = new this.wallet.eth.Contract(
          OneTimePaymentLinksABI.abi,
          OneTimePaymentLinksABI.networks[this.networkId].address,
          {
            from: this.account
          }
        )
        log.info('GoodWallet Ready.')
      })
      .catch(e => {
        log.error('Failed initializing GoodWallet', e)
        throw e
      })
    return this.ready
  }

  async claim() {
    try {
      const gas = await this.claimContract.methods.claimTokens().estimateGas()
      return this.claimContract.methods.claimTokens().send({
        gas,
        gasPrice: await this.wallet.eth.getGasPrice()
      })
    } catch (e) {
      log.info(e)
      return Promise.reject(e)
    }
  }

  async checkEntitlement() {
    return await this.claimContract.methods.checkEntitlement().call()
  }

  balanceChanged(callback: (error: any, event: any) => any): [Promise<any>, Promise<any>] {
    const fromHanlder: Promise<any> = this.tokenContract.events.Transfer(
      { fromBlock: 'latest', filter: { from: this.account } },
      callback
    )
    const toHandler: Promise<any> = this.tokenContract.events.Transfer(
      { fromBlock: 'latest', filter: { to: this.account } },
      callback
    )

    return [toHandler, fromHanlder]
  }

  async balanceOf() {
    return this.tokenContract.methods.balanceOf(this.account).call()
  }

  signMessage() {}

  sendTx() {}

  async getAccountForType(type: AccountUsage) {
    let account = this.accounts[AccountUsageToPath[type]].address || this.account
    return account
  }

  async sign(toSign: string, accountType: AccountUsage = 'gd') {
    let account = await this.getAccountForType(accountType)
    return this.wallet.eth.sign(toSign, account)
  }

  async isVerified(address: string): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(address).call()
    return tx
  }

  async isCitizen(): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(this.account).call()
    return tx
  }

  async canSend(amount: number) {
    const balance = await this.balanceOf()
    return amount < balance
  }

  async generateLink(amount: number) {
    if (!(await this.canSend(amount))) {
      throw new Error(`Amount is bigger than balance`)
    }

    const randomHex = this.wallet.utils.randomHex(10).replace('0x', '')
    const generatedString = this.wallet.utils.sha3(randomHex)
    const otpAddress = OneTimePaymentLinksABI.networks[this.networkId].address

    const deposit = this.oneTimePaymentLinksContract.methods.deposit(this.account, generatedString, amount)
    const encodedABI = await deposit.encodeABI()

    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, encodedABI)
    const balanceOf = this.tokenContract.methods.balanceOf(this.account)

    const gas = await transferAndCall.estimateGas().catch(this.handleError)
    const gasPrice = await this.getGasPrice()
    const balancePre = await balanceOf.call()
    log.info({ amount, gas, gasPrice, balancePre, otpAddress })

    const tx = await transferAndCall
      .send({ gas, gasPrice })
      .on('transactionHash', hash => log.info({ hash }))
      .catch(this.handleError)

    // FIXME: this call to deposit is forcing the deposit call which is not being triggered through `transferAndCall`
    // FIXME: also, `tansferAndCall` is required because calling only to `deposit` will fail as the contract has not funds
    // TODO: this `deposit` call must be removed after a fix in the contracts for the `transferAndCall` method call.
    await deposit
      .send({ gas, gasPrice })
      .on('transactionHash', hash => log.info({ hash }))
      .catch(this.handleError)

    const balancePost = await balanceOf.call()
    log.info({ tx, balancePost, otpAddress })

    return { sendLink: `${Config.publicUrl}/AppNavigation/Dashboard/Home?receiveLink=${randomHex}`, receipt: tx }
  }

  async canWithdraw(otlCode: string) {
    const { isLinkUsed, payments } = this.oneTimePaymentLinksContract.methods
    const { sha3, toBN } = this.wallet.utils

    const link = sha3(otlCode)
    const linkUsed = await isLinkUsed(link).call()
    log.info('isLinkUsed', linkUsed)

    if (!linkUsed) {
      throw new Error('invalid link')
    }

    const paymentAvailable = await payments(link)
      .call()
      .then(toBN)
    log.info(`paymentAvailable: ${paymentAvailable}`)

    if (paymentAvailable.lte(toBN('0'))) {
      throw new Error('payment already done')
    }

    const events = await this.oneTimePaymentLinksContract.getPastEvents('allEvents', { fromBlock: '0' })
    log.info({ events })
    const { sender } = _(events)
      .filter({ returnValues: { hash: link } })
      .map('returnValues')
      .value()[0]

    return {
      amount: paymentAvailable.toString(),
      sender
    }
  }

  async canWithdraw(otlCode: string) {
    const { isLinkUsed, payments } = this.oneTimePaymentLinksContract.methods
    const { sha3, toBN } = this.wallet.utils

    const link = sha3(otlCode)
    const linkUsed = await isLinkUsed(link).call()
    log.info('isLinkUsed', linkUsed)

    if (!linkUsed) {
      throw new Error('invalid link')
    }

    const paymentAvailable = await payments(link)
      .call()
      .then(toBN)
    log.info(`paymentAvailable: ${paymentAvailable}`)

    if (paymentAvailable.lte(toBN('0'))) {
      throw new Error('payment already done')
    }

    const events = await this.oneTimePaymentLinksContract.getPastEvents('allEvents', { fromBlock: '0' })
    log.info({ events })
    const { sender } = _(events)
      .filter({ returnValues: { hash: link } })
      .map('returnValues')
      .value()[0]

    return {
      amount: paymentAvailable.toString(),
      sender
    }
  }

  async withdraw(otlCode: string) {
    const gasPrice = await this.getGasPrice()
    log.info('gasPrice', gasPrice)

    const withdrawCall = this.oneTimePaymentLinksContract.methods.withdraw(otlCode)
    log.info('withdrawCall', withdrawCall)

    const gas = await withdrawCall.estimateGas().catch(this.handleError)
    log.info('gas', gas)

    return await withdrawCall
      .send({ gas, gasPrice })
      .on('transactionHash', hash => log.debug({ hash }))
      .catch(this.handleError)
  }

  handleError(err: Error) {
    log.error('handleError', { err })
    throw err
  }

  async getGasPrice() {
    let gasPrice = this.gasPrice

    try {
      const { toBN } = this.wallet.utils
      const networkGasPrice = await this.wallet.eth.getGasPrice().then(toBN)

      if (networkGasPrice.gt(toBN('0'))) {
        gasPrice = networkGasPrice.toString()
      }
    } catch (e) {
      log.error('failed to retrieve gas price from network', { e })
    }

    return gasPrice
  }

  async sendAmount(to: string, amount: number) {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSend(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    const gasPrice = await this.getGasPrice()

    const transferCall = this.tokenContract.methods.transfer(to, amount)
    const gas = await transferCall.estimateGas().catch(this.handleError)

    log.debug({ amount, to, gas })

    return await transferCall
      .send({ gas, gasPrice })
      .on('transactionHash', hash => log.debug({ hash }))
      .catch(this.handleError)
  }
}

export default new GoodWallet()
