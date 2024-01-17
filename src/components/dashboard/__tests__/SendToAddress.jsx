// eslint-disable-next-line import/order
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(25000)

describe('SendToAddress', () => {
  const SendToAddress = getWebRouterComponentWithMocks('../SendToAddress')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<SendToAddress />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
