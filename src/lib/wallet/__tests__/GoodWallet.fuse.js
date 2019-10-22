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

    await adminWallet.ready
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

  it('should emit WhitelistedAdded event filtered by ´from´ block', async () => {
    let testWallet3 = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })
    await testWallet3.ready
    const lastBlock = await testWallet3.getBlockNumber()

    testWallet3.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('WhitelistedAdded')
      expect(toBlock).toBeTruthy()
    })

    adminWallet.whitelistUser(testWallet3.account, 'did:gd')
  })

  it('should emit BlacklistAdded event filtered by ´from´ block', async () => {
    let testWallet3 = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })
    await testWallet3.ready
    const lastBlock = await testWallet3.getBlockNumber()

    testWallet3.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('BlacklistAdded')
      expect(toBlock).toBeTruthy()
    })

    adminWallet.blacklistUser(testWallet3.account, 'did:gd')
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

  it('should not allow transfer to blacklisted', async () => {
    await adminWallet.blacklistUser(testWallet2.account)

    try {
      await testWallet.sendAmount(testWallet2.account)
    } catch (err) {
      let condition = err.message.search('Receiver is blacklisted') > -1
      expect(condition).toBeTrue()
    }
  })

  it('should not allow transfer from blacklisted', async () => {
    await adminWallet.blacklistUser(testWallet.account)

    try {
      await testWallet.sendAmount(testWallet2.account)
    } catch (err) {
      let condition = err.message.search('Caller is blacklisted') > -1
      expect(condition).toBeTrue()
    }
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

      await testWallet2.withdraw(DEPOSIT_CODE)

      const res2 = await testWallet2.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)

      expect(res2).toBeFalse()
    })
  })

  it('should not allow blacklisted to deposit', () => {
    return testWallet.ready.then(async () => {
      const DEPOSIT_CODE = 'test'
      const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
      const balance = await testWallet.balanceOf()
      expect(balance).toBeGreaterThan(0)

      await adminWallet.blacklistUser(testWallet.account)

      try {
        await testWallet.depositToHash(balance, DEPOSIT_CODE_HASH)
      } catch (err) {
        let condition = err.message.search('Caller is blacklisted') > -1
        expect(condition).toBeTrue()
      }
    })
  })

  it('should not allow blacklisted to withdraw', () => {
    return testWallet.ready.then(async () => {
      const DEPOSIT_CODE = 'test'
      const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
      const balance = await testWallet.balanceOf()
      expect(balance).toBeGreaterThan(0)

      await adminWallet.blacklistUser(testWallet2.account)

      await testWallet.depositToHash(balance, DEPOSIT_CODE_HASH)

      const isused = await testWallet2.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)
      expect(isused).to.be.true()
      try {
        await testWallet2.withdraw(DEPOSIT_CODE)
      } catch (err) {
        let condition = err.message.search('Receiver is blacklisted') > -1
        expect(condition).toBeTrue()
      }
    })
  })

  it('should not allow non-whitelisted to claim', () => {
    let testWallet3 = new GoodWallet({
      web3Transport: Config.web3TransportProvider,
    })

    return testWallet3.ready.then(async () => {
      const claimDays = await testWallet3.getNextClaimTime()

      expect(claimDays).toBeGreaterThan(0)

      try {
        await testWallet3.claim()
      } catch (err) {
        let condition = err.message.search('is not whitelisted') > -1
        expect(condition).toBeTrue()
      }
    })
  })

  it('should not allow blacklisted to claim', () => {
    return testWallet2.ready.then(async () => {
      const claimDays = await testWallet2.getNextClaimTime()

      expect(claimDays).toBeGreaterThan(0)

      await adminWallet.blacklistUser(testWallet2.account)

      try {
        await testWallet2.claim()
      } catch (err) {
        let condition = err.message.search('Receiver is blacklisted') > -1
        expect(condition).toBeTrue()
      }
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
        let condition = err.message.search('has already claimed') > -1
        expect(condition).toBeTrue()
      }
    })
  })
})
