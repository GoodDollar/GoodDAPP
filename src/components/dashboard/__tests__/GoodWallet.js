import goodWallet from '../../../lib/wallet/GoodWallet'

describe('GoodWalletShare/ReceiveTokens', () => {
  const amount = 1
  let OTLCode

  it('should get balance', async () => {
    const data = await goodWallet.balanceOf()
    const balance = parseInt(data)

    expect(balance).toBe(0)
  })

  it('should generate payment link', () => {
    const reason = 'Test_Reason'

    const paymentData = goodWallet.generateLink(amount, reason, data => data)

    OTLCode = paymentData.hashedCode

    expect(paymentData).toEqual({
      code: expect.any(String),
      hashedCode: expect.any(String),
      paymentLink: expect.stringMatching(new RegExp(`reason=${reason}`)),
    })
  })

  it('should fail fetch withdraw data', () => {
    goodWallet.canSend(amount).catch(e => expect(e).toEqual('Amount is bigger than balance'))
  })

  it('should fail withdraw', () => {
    goodWallet.withdraw(OTLCode).catch(e => expect(e).toEqual('Amount is bigger than balance'))
  })

  it('should fail withdraw cancellation', () => {
    goodWallet.cancelOTLByTransactionHash(OTLCode).catch(e => expect(e).toEqual('Impossible to cancel OTL'))
  })
})
