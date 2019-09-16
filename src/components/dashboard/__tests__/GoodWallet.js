import { GoodWallet } from '../../../lib/wallet/GoodWalletClass'
import Config from '../../../config/config'
import { gdToWei } from '../../../lib/wallet/utils'
import adminWallet from './__util__/AdminWallet'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(90000)

  const amount = gdToWei(0.1)
  const reason = 'Test_Reason'
  let testWallet
  let testWallet2

  beforeAll(async () => {
    testWallet = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })
    testWallet2 = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })

    await testWallet.ready
    await testWallet2.ready

    await adminWallet.whitelistUser(testWallet.account, 'did:gd')
    await adminWallet.whitelistUser(testWallet2.account, 'did:gd')

    await adminWallet.topWallet(testWallet.account)
    await adminWallet.topWallet(testWallet2.account)
  })

  it('should emit `transfer` event filtered by `to` block', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    testWallet.balanceChanged((error, event) => {
      expect(error).toBeFalsy()
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
    })

    await testWallet.claim()
  })

  it('should say that there is enough G$ on users balance to send including fee', async () => {
    const newAmount = gdToWei(0.9)
    const canSend = await testWallet.canSend(newAmount)

    expect(canSend).toBeTruthy()
  })

  it('should fail as there is no enough G$ including fee on users balance', async () => {
    const newAmount = gdToWei(1)
    const canSend = await testWallet.canSend(newAmount)

    // should fail because testWallet have only 1 G$, after including fee - canSend should return false
    expect(canSend).toBeFalsy()
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

  it('should emit `PaymentCancel` event', () => {
    const linkData = testWallet.generateLink(amount, reason, async () => {
      const lastBlock = await testWallet.getBlockNumber()

      testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
        expect(event).toBeTruthy()
        expect(event.event).toBe('PaymentCancel')
        expect(toBlock).toBeTruthy()
      })

      testWallet.cancelOTL(linkData.hashedCode)
    })
  })
})
