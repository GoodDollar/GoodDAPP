// eslint-disable-next-line import/order

import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(25000)

describe('Send', () => {
  it('matches snapshot', async () => {
    const Send = getWebRouterComponentWithMocks('../Send')
    let component
    await renderer.act(async () => (component = renderer.create(<Send />)))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
