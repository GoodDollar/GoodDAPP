import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'
import UserAvatar from '../UserAvatar'
import { theme } from '../../../theme/styles'

// Note: test renderer must be required after react-native.

describe('UserAvatar', () => {
  const profile = {
    fullName: 'John Doe',
    email: 'a****a@aaa.com',
    mobile: '*********444'
  }

  it('renders without errors', () => {
    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <UserAvatar profile={profile} />
      </PaperProvider>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <UserAvatar profile={profile} />
      </PaperProvider>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
