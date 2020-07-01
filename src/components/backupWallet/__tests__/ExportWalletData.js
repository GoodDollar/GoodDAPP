import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

// utils
import { getWebRouterComponentWithMocks } from './__util__'
import GoodWallet from '../../../lib/wallet/GoodWallet'


describe('ReceiveToAddress', () => {
  const ExportWalletData = getWebRouterComponentWithMocks('../ExportWalletData')

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
