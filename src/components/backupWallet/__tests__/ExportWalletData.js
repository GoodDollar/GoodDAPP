import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import GoodWallet from '../../../lib/wallet/GoodWallet'

// utils
import { getWebRouterComponentWithMocks } from './__util__'

describe('ReceiveToAddress', () => {
  const { wallet } = GoodWallet
  const ExportWalletData = getWebRouterComponentWithMocks('../ExportWalletData')
  const privateKey = 'fake-wallet-private-key'

  beforeAll(() => (GoodWallet.wallet = { eth: { accounts: { wallet: [{ privateKey }] } } }))

  afterAll(() => Object.assign(GoodWallet, { wallet }))

  it('renders without errors', () => {
    const tree = renderer.create(<ExportWalletData />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ExportWalletData />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
