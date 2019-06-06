import React from 'react'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Profile', () => {
  it('renders without errors', () => {
    const EditProfile = getWebRouterComponentWithMocks('../../profile/EditProfile.web')

    const tree = renderer.create(<EditProfile />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const EditProfile = getWebRouterComponentWithMocks('../../profile/EditProfile.web')
    const component = renderer.create(<EditProfile />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
