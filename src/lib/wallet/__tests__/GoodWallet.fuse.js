import { GoodWallet } from '../GoodWalletClass'
import Config from '../../../config/config'
import { gdToWei } from '../utils'
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

  it('should allow transferring', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    testWallet.sendAmount(testWallet2.account)
  })

  it('should be verified', () => {
    return testWallet.ready.then(async () => {
      const isVerified = await testWallet.isCitizen()

      expect(isVerified).toBeTrue()
    })
  })

  it('should deposit and withdraw properly', () => {
    return testWallet.ready.then(async () => {
      const DEPOSIT_CODE = 'test'
      const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
      const balance = await testWallet.balanceOf()

      expect(balance).toBeGreaterThan(0)

      const fee = await testWallet.calculateTxfee(balance)

      await testWallet.depositToHash(balance, DEPOSIT_CODE_HASH)

      const newBalance = await testWallet.balanceOf()

      expect(newBalance).to.be.equal(0)

      const isused = await testWallet.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)
      expect(isused).to.be.true()

      const res = await testWallet.canWithdraw(DEPOSIT_CODE)

      expect(res[0]).to.be.equal(balance.sub(fee))
    })
  })

  it('should claim UBI', () => {
    return testWallet.ready.then(async () => {
      const claimDays = await testWallet.getNextClaimTime()

      expect(claimDays).toBeGreaterThan(0)

      await testWallet.claim()
    })
  })

  it('should not claim UBI', () => {
    return testWallet.ready.then(async () => {
      const claimDays = await testWallet.getNextClaimTime()

      expect(claimDays).toBeGreaterThan(0)

      await testWallet.claim()

      try {
        await testWallet.claim()
      } catch (err) {
        let condition = err.message.search('VM Exception while processing transaction') > -1
        expect(condition).toBeTrue()
      }
    })
  })
})
