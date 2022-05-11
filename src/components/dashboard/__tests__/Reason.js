import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('Reason', () => {
  it('matches snapshot', async () => {
    const Reason = getWebRouterComponentWithMocks('../Reason')
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<Reason />)))
    tree = tree.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
