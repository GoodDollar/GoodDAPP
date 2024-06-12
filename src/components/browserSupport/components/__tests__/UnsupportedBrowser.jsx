import React from 'react'
import { noop } from 'lodash'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'

describe('UnsupportedBrowser', () => {
  let UnsupportedBrowser
  beforeAll(() => {
    jest.doMock('../../../../lib/wallet/GoodWallet', () => {
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

    UnsupportedBrowser = withThemeAndLocalizationProvider('../UnsupportedBrowser')
  })
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<UnsupportedBrowser onDissmiss={noop} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
