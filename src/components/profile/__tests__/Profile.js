// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.

jest.setTimeout(30000)

describe('Profile', () => {
  it('matches snapshot', async () => {
    const Profile = getWebRouterComponentWithMocks('../../profile/Profile')
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => {
      tree = renderer.create(<Profile />)
    })
    expect(tree).toMatchSnapshot()
  })
})
