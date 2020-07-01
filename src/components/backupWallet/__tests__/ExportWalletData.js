import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

// utils
import { getWebRouterComponentWithMocks } from './__util__'

describe('ReceiveToAddress', () => {
  let ExportWalletData
  
  beforeAll(() => { 
    jest.doMock('../../../lib/wallet/GoodWallet', () => {
      return {
        wallet: {
          eth: {
            accounts: {
              wallet: [{ privateKey: 'fake-wallet-private-key' }],
            },
          },
        },
      }
    })
    
    ExportWalletData = getWebRouterComponentWithMocks('../ExportWalletData') 
  })

  afterAll(() => jest.dontMock('../../../lib/wallet/GoodWallet'))

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
