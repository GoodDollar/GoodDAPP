import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('SurveySend', () => {
  it('matches snapshot', async () => {
    const SurveySend = getWebRouterComponentWithMocks('../SurveySend')
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<SurveySend />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
