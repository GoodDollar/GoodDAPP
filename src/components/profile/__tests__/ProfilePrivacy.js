import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('ProfilePrivacy', () => {
  it('renders without errors', () => {
    const ProfilePrivacy = getWebRouterComponentWithMocks('../../profile/ProfilePrivacy')

    const tree = renderer.create(<ProfilePrivacy />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ProfilePrivacy = getWebRouterComponentWithMocks('../../profile/ProfilePrivacy')
    const component = renderer.create(<ProfilePrivacy />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
