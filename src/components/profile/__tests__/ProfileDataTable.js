import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'
import ProfileDataTable from '../ProfileDataTable'
import { theme } from '../../theme/styles'

describe('ProfileDataTable', () => {
  const profile = { email: 'john@doe.com', mobile: '2222222222222' }

  it('matches snapshot', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <ProfileDataTable profile={profile} />
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot editable', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <ProfileDataTable profile={profile} editable={true} />
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot editable with errors', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <ProfileDataTable profile={profile} editable={true} errors={{ mobile: 'error', email: 'error' }} />
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
