import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('VerifyEditCode', () => {
  it('matches snapshot', async () => {
    const VerifyEditCode = getWebRouterComponentWithMocks('../../profile/VerifyEditCode')

    let tree
    await renderer.act(async () => {
      tree = renderer.create(<VerifyEditCode />)
    })

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
