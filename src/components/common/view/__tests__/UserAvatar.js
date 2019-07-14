import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'

import ImportedUserAvatar from '../UserAvatar'
const UserAvatar = withThemeProvider(ImportedUserAvatar)

// Note: test renderer must be required after react-native.

describe('UserAvatar', () => {
  const profile = {
    fullName: 'John Doe',
    email: 'a****a@aaa.com',
    mobile: '*********444',
  }

  it('renders without errors', () => {
    const tree = renderer.create(<UserAvatar profile={profile} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<UserAvatar profile={profile} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
