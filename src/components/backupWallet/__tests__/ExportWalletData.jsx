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
        account: 'fake-wallet-address',
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

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<ExportWalletData />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
