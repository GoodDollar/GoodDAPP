import { GoodWallet } from '../WalletClassSelector'
import adminWallet from './__util__/AdminWalletV1'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(120000)
  const amount = 1
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

    await adminWallet.whitelistUser(testWallet.account, 'did:gd' + Math.random())
    await adminWallet.whitelistUser(testWallet2.account, 'did:gd' + Math.random())

    await adminWallet.topWallet(testWallet.account, 0, true)

    await adminWallet.topWallet(testWallet2.account, 0, true)

    const lastBlock = await testWallet.getBlockNumber()

    testWallet.watchEvents(lastBlock, () => {})
    testWallet2.watchEvents(lastBlock, () => {})
  })

  // eslint-disable-next-line require-await
  it('should be whitelisted and with gas', async () => {
    expect(testWallet.isCitizen()).resolves.toBeTruthy()
    expect(testWallet2.isCitizen()).resolves.toBeTruthy()
    expect(testWallet.verifyHasGas(null, { topWallet: false })).resolves.toBeTruthy()
    expect(testWallet2.verifyHasGas(null, { topWallet: false })).resolves.toBeTruthy()
  })

  it('should estimate gas', async () => {
    const tx = testWallet.UBIContract.methods.claim()
    const gas = await tx.estimateGas().catch(e => {
      return false
    })
    expect(gas).toBeTruthy()
  })

  it('should claim and emit transfer event', done => {
    let eventId = testWallet.subscribeToEvent('balanceChanged', events => {
      expect(events).toBeFalsy()
      testWallet.unsubscribeFromEvent(eventId)
      done()
    })
    const run = async () => {
      expect(await testWallet.claim()).toBeTruthy()
      expect(await testWallet.balanceOf()).toBeGreaterThan(0)
    }
    run()
  })

  it('should allow token transfer', async () => {
    await testWallet.sendAmount(testWallet2.account, 1)
    expect(await testWallet2.balanceOf()).toBe(1)
  })

  it('should deposit payment and withdraw', async () => {
    const linkData = testWallet.generatePaymentLink(amount, reason)
    expect(await linkData.txPromise).toBeTruthy()
    expect(await testWallet2.withdraw(linkData.code)).toBeTruthy()
  })

  it('should deposit payment and cancel', async () => {
    const linkData = testWallet.generatePaymentLink(amount, reason)
    expect(await linkData.txPromise).toBeTruthy()
    expect(await testWallet.cancelOTL(linkData.hashedCode)).toBeTruthy()
  })

  it('should deposit and withdraw properly', async () => {
    await adminWallet.topWallet(testWallet.account, 0, true)
    await adminWallet.topWallet(testWallet2.account, 0, true)
    const { privateKey: DEPOSIT_CODE } = testWallet.wallet.eth.accounts.create()
    const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
    const asParam = testWallet.wallet.eth.abi.encodeParameter('address', DEPOSIT_CODE_HASH)

    const balance = await testWallet.balanceOf().then(n => Number(n))

    expect(balance).toBeGreaterThan(0)

    const fee = await testWallet.getTxFee(balance)

    await testWallet.depositToHash(balance, asParam)

    const newBalance = await testWallet.balanceOf()

    expect(newBalance).toEqual(0)

    const isused = await testWallet.isPaymentLinkAvailable(DEPOSIT_CODE_HASH)
    expect(isused).toBeTruthy()
    const res = await testWallet.getWithdrawDetails(DEPOSIT_CODE)

    expect(parseInt(res.amount)).toEqual(balance - fee)
    expect(res.sender).toEqual(testWallet.account)
    await testWallet2.withdraw(DEPOSIT_CODE)

    const res2 = await testWallet2.isPaymentLinkAvailable(DEPOSIT_CODE_HASH)

    expect(res2).toBeFalsy()
  })

  it('should emit PaymentWithdraw and transfer event filtered by from block', done => {
    const run = async () => {
      await adminWallet.topWallet(testWallet.account, 0, true)
      await adminWallet.topWallet(testWallet2.account, 0, true)
      expect(await testWallet2.claim()).toBeTruthy()
      const linkData = testWallet2.generatePaymentLink(amount, reason)
      expect(await linkData.txPromise.catch(_ => false)).toBeTruthy()
      const withdrawRes = await testWallet.withdraw(linkData.code).catch(e => {
        // console.log('withdraw failed', e.message, e)
        return false
      })
      expect(withdrawRes).toBeTruthy()
    }
    let eventId = testWallet2.subscribeToEvent('receiptUpdated', receipt => {
      expect(receipt).toBeTruthy()
      const event = receipt.logs.find(_ => _.name === 'PaymentWithdraw')
      if (!event) {
        return
      }
      expect(event.name).toBe('PaymentWithdraw')
      testWallet2.unsubscribeFromEvent(eventId)
      done()
    })
    run()
  })

  it('should emit PaymentCancel event', done => {
    const run = async () => {
      expect(await testWallet2.claim().catch(_ => true)).toBeTruthy()

      const { txPromise, hashedCode } = testWallet2.generatePaymentLink(amount, reason)
      await txPromise
      const cancelTX = await testWallet2.cancelOTL(hashedCode).catch(_ => false)
      expect(cancelTX).toBeTruthy()
    }
    run()

    let eventId = testWallet2.subscribeToEvent('receiptUpdated', receipt => {
      expect(receipt).toBeTruthy()
      const event = receipt.logs.find(_ => _.name === 'PaymentCancel')
      if (!event) {
        return
      }
      expect(event.name).toBe('PaymentCancel')
      testWallet2.unsubscribeFromEvent(eventId)
      done()
    })
  })
})
