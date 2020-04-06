import { GoodWallet } from '../GoodWalletClass'
import adminWallet from './__util__/AdminWalletV1'
import '../PaymentLinks'

describe('GoodWalletShare/ReceiveTokens', () => {
  jest.setTimeout(100000)
  const amount = 1
  const reason = 'Test_Reason'
  let testWallet
  let testWallet2

  beforeAll(async () => {
    testWallet = new GoodWallet({
      web3Transport: 'WebSocketProvider',
    })
    testWallet2 = new GoodWallet({
      web3Transport: 'WebSocketProvider',
    })

    await adminWallet.ready

    await testWallet.ready

    await testWallet2.ready

    await adminWallet.whitelistUser(testWallet.account, 'did:gd' + Math.random())
    await adminWallet.whitelistUser(testWallet2.account, 'did:gd' + Math.random())

    await adminWallet.topWallet(testWallet.account, 0, true)

    await adminWallet.topWallet(testWallet2.account, 0, true)

    const lastBlock = await testWallet.getBlockNumber()

    testWallet.listenTxUpdates(lastBlock, () => {})
    testWallet2.listenTxUpdates(lastBlock, () => {})
  })

  it('should be whitelisted and with gas', async () => {
    expect(testWallet.isCitizen()).resolves.toBeTruthy()
    expect(testWallet2.isCitizen()).resolves.toBeTruthy()
    const b1 = await testWallet.balanceOfNative()
    expect(b1).toBeGreaterThan(10000000)
  })

  it('should estimate gas', async () => {
    const tx = testWallet.UBIContract.methods.claim()
    const gas = await tx.estimateGas().catch(e => {
      return false
    })
    expect(gas).toBeTruthy()
  })

  it('should claim and emit transfer event', async done => {
    let eventId = testWallet.subscribeToEvent('balanceChanged', event => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('Transfer')
      done()
    })
    expect(await testWallet.claim()).toBeTruthy()
    expect(await testWallet.balanceOf()).toBeGreaterThan(0)
    testWallet.unsubscribeFromEvent(eventId)
  })

  it('should allow token transfer', async () => {
    await testWallet.sendAmount(testWallet2.account, 1)
    expect(await testWallet2.balanceOf()).toBe(1)
  })

  it('should deposit payment and withdraw', async () => {
    const linkData = testWallet.generateLink(amount, reason)
    expect(await linkData.txPromise).toBeTruthy()
    expect(await testWallet2.withdraw(linkData.code)).toBeTruthy()
  })

  it('should deposit payment and cancel', async () => {
    const linkData = testWallet.generateLink(amount, reason)
    expect(await linkData.txPromise).toBeTruthy()
    expect(await testWallet.cancelOTL(linkData.hashedCode)).toBeTruthy()
  })

  it('should deposit and withdraw properly', async () => {
    const { privateKey: DEPOSIT_CODE } = testWallet.wallet.eth.accounts.create()
    const DEPOSIT_CODE_HASH = testWallet.getWithdrawLink(DEPOSIT_CODE)
    const asParam = testWallet.wallet.eth.abi.encodeParameter('address', DEPOSIT_CODE_HASH)

    const balance = await testWallet.balanceOf().then(n => Number(n))

    expect(balance).toBeGreaterThan(0)

    const fee = await testWallet.getTxFee(balance)

    await testWallet.depositToHash(balance, asParam)

    const newBalance = await testWallet.balanceOf()

    expect(newBalance).toEqual(0)

    const isused = await testWallet.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)
    expect(isused).toBeTruthy()
    const res = await testWallet.getWithdrawDetails(DEPOSIT_CODE)

    expect(parseInt(res.amount)).toEqual(balance - fee)
    expect(res.sender).toEqual(testWallet.account)
    await testWallet2.withdraw(DEPOSIT_CODE)

    const res2 = await testWallet2.isWithdrawLinkUsed(DEPOSIT_CODE_HASH)

    expect(res2).toBeFalsy()
  })

  it('should emit PaymentWithdraw and transfer event filtered by from block', async done => {
    expect(await testWallet2.claim()).toBeTruthy()

    const linkData = testWallet2.generateLink(amount, reason)
    expect(await linkData.txPromise.catch(_ => false)).toBeTruthy()
    let eventId = testWallet2.subscribeToEvent('otplUpdated', receipt => {
      expect(receipt).toBeTruthy()
      expect(receipt.logs[1].name).toBe('PaymentWithdraw')
      done()
    })

    expect(await testWallet.withdraw(linkData.code).catch(_ => false)).toBeTruthy()
    testWallet2.unsubscribeFromEvent(eventId)
  })

  it('should emit PaymentCancel event', async done => {
    expect(await testWallet2.claim().catch(_ => true)).toBeTruthy()

    const { txPromise, hashedCode } = testWallet2.generateLink(amount, reason)
    await txPromise

    let eventId = testWallet2.subscribeToEvent('otplUpdated', receipt => {
      expect(receipt).toBeTruthy()
      expect(receipt.logs[1].name).toBe('PaymentCancel')
      done()
    })

    expect(await testWallet2.cancelOTL(hashedCode).catch(_ => false)).toBeTruthy()
    testWallet2.unsubscribeFromEvent(eventId)
  })
})
