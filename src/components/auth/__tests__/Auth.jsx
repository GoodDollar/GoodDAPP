import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

// Note: test renderer must be required after react-native.

describe('Auth', () => {
  it('matches snapshot', async () => {
    const Auth = getWebRouterComponentWithMocks('../Auth')
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<Auth />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
