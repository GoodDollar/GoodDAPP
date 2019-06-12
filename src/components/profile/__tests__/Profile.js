import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('Profile', () => {
  it('renders without errors', () => {
    const Profile = getWebRouterComponentWithMocks('../../profile/Profile')

    const tree = renderer.create(<Profile />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Profile = getWebRouterComponentWithMocks('../../profile/Profile')
    const component = renderer.create(<Profile />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
