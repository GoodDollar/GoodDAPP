// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.

jest.setTimeout(30000)

describe('VerifyEdit', () => {
  it('matches snapshot', async () => {
    const VerifyEdit = getWebRouterComponentWithMocks('../../profile/VerifyEdit')

    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<VerifyEdit />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
