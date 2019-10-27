import { GoodWallet } from '../GoodWalletClass'
import adminWallet from './__util__/AdminWallet'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(50000)

  const amount = '1'
  const reason = 'Test_Reason'
  let testWallet
  let testWallet2

  beforeAll(async () => {
    testWallet = new GoodWallet({
      web3Transport: 'HttpProvider',
    })
    testWallet2 = new GoodWallet({
      web3Transport: 'HttpProvider',
    })

    await adminWallet.ready
    await testWallet.ready

    await testWallet2.ready

    await adminWallet.whitelistUser(testWallet.account, 'did:gd')
    await adminWallet.whitelistUser(testWallet2.account, 'did:gd')

    await adminWallet.topWallet(testWallet.account, 0, true)

    await adminWallet.topWallet(testWallet2.account, 0, true)
  })

  it('should be whitelisted and with gas', async () => {
    expect(testWallet.isCitizen()).resolves.toBeTruthy()
    expect(testWallet2.isCitizen()).resolves.toBeTruthy()
    const b1 = await testWallet.balanceOfNative()
    expect(b1).toBeGreaterThan(10000000)
  })

  it('should claim and emit transfer event', async done => {
    // const lastBlock = await testWallet.getBlockNumber()

    // let i = 0
    // testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
    //   expect(event).toBeTruthy()
    //   expect(event.event).toBe('Transfer')
    //   expect(toBlock).toBeTruthy()
    //   i += 1
    //   if (i == 2) done()
    // })

    // testWallet.balanceChanged((error, event) => {
    //   expect(error).toBeFalsy()
    //   expect(event).toBeTruthy()
    //   expect(event[0].event).toBe('Transfer')
    //   i += 1
    //   if (i == 2) done()
    // })
    expect(await testWallet.claim()).toBeTruthy()
    expect(await testWallet.balanceOf()).toBeGreaterThan(0)
    done()
  })

  it('should allow token transfer', async () => {
    await testWallet.sendAmount(testWallet2.account, 1)
    expect(await testWallet2.balanceOf()).toBe(1)
  })

  it('should deposit payment and withdraw', async () => {
    const linkData = testWallet.generateLink(amount, reason, () => () => {})
    expect(await linkData.txPromise.catch(_ => false)).toBeTruthy()
    expect(await testWallet2.withdraw(linkData.code).catch(_ => false)).toBeTruthy()
  })

  it('should deposit payment and cancel', async () => {
    const linkData = testWallet.generateLink(amount, reason, () => () => {})
    expect(await linkData.txPromise.catch(_ => false)).toBeTruthy()
    expect(await testWallet.cancelOTL(linkData.hashedCode).catch(_ => false)).toBeTruthy()
  })

  it('should deposit and withdraw properly', async () => {
    const DEPOSIT_CODE = testWallet.wallet.utils.randomHex(10).replace('0x', '')
    const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
    const balance = await testWallet.balanceOf().then(n => Number(n))

    expect(balance).toBeGreaterThan(0)

    const fee = await testWallet.getTxFee(balance)

    await testWallet.depositToHash(balance, DEPOSIT_CODE_HASH)

    const newBalance = await testWallet.balanceOf()

    expect(newBalance).toEqual(0)

    const isused = await testWallet.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)
    expect(isused).toBeTruthy()
    const res = await testWallet.canWithdraw(DEPOSIT_CODE)

    expect(parseInt(res.amount)).toEqual(balance - fee)

    await testWallet2.withdraw(DEPOSIT_CODE)

    const res2 = await testWallet2.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)

    expect(res2).toBeFalsy()
  })

  xit('should emit PaymentWithdraw and transfer event filtered by from block', async done => {
    const lastBlock = await testWallet.getBlockNumber()
    expect(await testWallet2.claim()).toBeTruthy()

    const linkData = testWallet2.generateLink(amount, reason, () => () => {})
    expect(await linkData.txPromise.catch(_ => false)).toBeTruthy()
    let i = 0
    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('PaymentWithdraw')
      expect(toBlock).toBeTruthy()
      i += 1
      if (i == 2) {
        done()
      }
    })

    testWallet2.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
      i += 1
      if (i == 2) {
        done()
      }
    })

    expect(await testWallet2.withdraw(linkData.code).catch(_ => false)).toBeTruthy()
  })

  xit('should emit PaymentCancel event', async done => {
    const { txPromise, hashedCode } = testWallet.generateLink(amount, reason)
    const lastBlock = await testWallet.getBlockNumber()
    await txPromise

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('PaymentCancel')
      expect(toBlock).toBeTruthy()
      done()
    })

    expect(await testWallet.cancelOTL(hashedCode).catch(_ => false)).toBeTruthy()
  })

  xit('should allow transferring', async () => {
    const lastBlock = await testWallet.getBlockNumber()

    testWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event[0].event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    testWallet.sendAmount(testWallet2.account)
  })

  xit('should not allow blacklisted to deposit', () => {
    return testWallet.ready.then(async () => {
      const DEPOSIT_CODE = 'test3'
      const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
      const balance = await testWallet.balanceOf().then(n => Number(n))
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

  xit('should not allow blacklisted to withdraw', () => {
    return testWallet.ready.then(async () => {
      const DEPOSIT_CODE = 'test4'
      const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
      const balance = await testWallet.balanceOf().then(n => Number(n))
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
})
