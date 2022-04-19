// eslint-disable-next-line import/order
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(30000)

describe('Amount', () => {
  const Amount = getWebRouterComponentWithMocks('../Amount')

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<Amount />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
