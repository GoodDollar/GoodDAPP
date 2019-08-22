import web3Utils from 'web3-utils'
import { GoodWallet } from '../../../lib/wallet/GoodWalletClass'
import Config from '../../../config/config'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(30000)

  const amount = 0.1
  const reason = 'Test_Reason'
  let adminWallet
  let testWallet
  let testWallet2

  beforeAll(async () => {
    const mnemonic = process.env.REACT_APP_ADMIN_MNEMONIC
    adminWallet = new GoodWallet({
      mnemonic,
      web3Transport: Config.web3TransportProvider,
    })
    testWallet = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })
    testWallet2 = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })

    await adminWallet.ready
    await testWallet.ready
    await testWallet2.ready

    const testWalletBalance = await adminWallet.wallet.eth.getBalance(testWallet.account)
    const testWallet2Balance = await adminWallet.wallet.eth.getBalance(testWallet2.account)

    let toTop = parseInt(web3Utils.toWei('1000000', 'gwei')) - testWalletBalance
    let toTop2 = parseInt(web3Utils.toWei('1000000', 'gwei')) - testWallet2Balance

    let nonce = await adminWallet.wallet.eth.getTransactionCount(adminWallet.account)

    if (toTop / 1000000 >= 0.75) {
      await new Promise((resolve, reject) => {
        adminWallet.wallet.eth
          .sendTransaction({
            from: adminWallet.account,
            to: testWallet.account,
            value: toTop,
            gas: 100000,
            gasPrice: web3Utils.toWei('1', 'gwei'),
            chainId: adminWallet.networkId,
            nonce: parseInt(nonce),
          })
          .on('receipt', r => {
            resolve(r)
          })
          .on('error', e => {
            reject(e)
          })
      })
    }

    nonce = await adminWallet.wallet.eth.getTransactionCount(adminWallet.account)

    if (toTop2 / 1000000 >= 0.75) {
      await new Promise((resolve, reject) => {
        adminWallet.wallet.eth
          .sendTransaction({
            from: adminWallet.account,
            to: testWallet2.account,
            value: toTop2,
            gas: 100000,
            gasPrice: web3Utils.toWei('1', 'gwei'),
            chainId: adminWallet.networkId,
            nonce: parseInt(nonce),
          })
          .on('receipt', r => {
            resolve(r)
          })
          .on('error', e => {
            reject(e)
          })
      })
    }
  })

  it('should emit `transfer` event filtered  by`to` block', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    testWallet.balanceChanged((error, event) => {
      expect(error).toBeFalsy()
      expect(event).toBeTruthy()
      expect(event.event).toBe('Transfer')
    })

    const nonce = await testWallet.wallet.eth.getTransactionCount(testWallet.account)
    const tx = testWallet.claimContract.methods.claimTokens()
    const txGasEstimation = await tx.estimateGas()

    tx.send({
      gas: txGasEstimation,
      gasPrice: web3Utils.toWei('1', 'gwei'),
      chainId: testWallet.networkId,
      nonce: parseInt(nonce),
    })
  })

  it('should emit `PaymentWithdraw` and `transfer` event filtered by `from` block', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    const linkData = testWallet.generateLink(amount, reason, () => {})

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('PaymentWithdraw')
      expect(toBlock).toBeTruthy()
    })

    testWallet2.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    testWallet2.withdraw(linkData.hashedCode)
  })

  it('should emit `PaymentCancel` event', async () => {
    const lastBlock = await testWallet2.getBlockNumber()

    const linkData = testWallet2.generateLink(amount, reason, () => {})

    testWallet2.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('PaymentCancel')
      expect(toBlock).toBeTruthy()
    })

    testWallet2.cancelOTL(linkData.hashedCode)
  })
})
