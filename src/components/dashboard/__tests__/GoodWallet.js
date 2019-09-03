import { GoodWallet } from '../../../lib/wallet/GoodWalletClass'
import Config from '../../../config/config'
import { gdToWei } from '../../../lib/wallet/utils'
import adminWallet from './__util__/AdminWallet'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(60000)

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

    await adminWallet.topWallet(testWallet.account)

    await testWallet.claim()
  })

  it('should emit `PaymentWithdraw` and `transfer` event filtered by `from` block', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    await adminWallet.topWallet(testWallet.account)
    await adminWallet.topWallet(testWallet2.account)

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

    adminWallet.topWallet(testWallet2.account)
    const linkData = testWallet2.generateLink(amount, reason, () => {})

    testWallet2.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('PaymentCancel')
      expect(toBlock).toBeTruthy()
    })

    testWallet2.cancelOTL(linkData.hashedCode)
  })
})
