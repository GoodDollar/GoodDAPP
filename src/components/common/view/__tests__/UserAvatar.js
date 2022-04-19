import React from 'react'
import renderer from 'react-test-renderer'
import UserAvatar from '../UserAvatar'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('UserAvatar', () => {
  const profile = {
    fullName: 'John Doe',
    email: 'a****a@aaa.com',
    mobile: '*********444',
  }

  const WrappedUserAvatar = withThemeProvider(UserAvatar)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedUserAvatar profile={profile} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
