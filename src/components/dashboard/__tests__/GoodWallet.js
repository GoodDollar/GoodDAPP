import goodWallet from '../../../lib/wallet/GoodWallet'

describe('GoodWalletShare/ReceiveTokens', () => {
  const amount = 0.1
  const reason = 'Test_Reason'
  let code

  it('should emit `transfer` event filtered  by`to` block', async () => {
    await goodWallet.ready
    const lastBlock = goodWallet.getBlockNumber()

    goodWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    const data = goodWallet.generateLink(amount, reason, () => {})

    code = data.hashedCode
  })

  it('should emit `transfer` event filtered by `from` block', () => {
    const lastBlock = goodWallet.getBlockNumber()

    goodWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('Transfer')
      expect(toBlock).toBeTruthy()
    })

    goodWallet.withdraw(code)
  })

  it('should emit `PaymentWithdraw` event', () => {
    const lastBlock = goodWallet.getBlockNumber()

    const linkData = goodWallet.generateLink(amount, reason, () => {})

    goodWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('PaymentWithdraw')
      expect(toBlock).toBeTruthy()
    })

    goodWallet.withdraw(linkData.hashedCode)
  })

  it('should emit `PaymentWithdraw` event', () => {
    const lastBlock = goodWallet.getBlockNumber()

    const linkData = goodWallet.generateLink(amount, reason, () => {})

    goodWallet.listenTxUpdates(lastBlock, ({ toBlock, event }) => {
      expect(event).toBeTruthy()
      expect(event.event).toBe('PaymentCancel')
      expect(toBlock).toBeTruthy()
    })

    goodWallet.cancelOTL(linkData.hashedCode)
  })
})
