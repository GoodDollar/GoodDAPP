import React from 'react'
import renderer from 'react-test-renderer'

import ProfileDataTable from '../ProfileDataTable'

describe('ProfileDataTable', () => {
  const profile = { email: 'john@doe.com', mobile: '2222222222222' }

  it('renders without errors', () => {
    const tree = renderer.create(<ProfileDataTable profile={profile} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ProfileDataTable profile={profile} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot editable', () => {
    const component = renderer.create(<ProfileDataTable profile={profile} editable={true} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot editable with errors', () => {
    const component = renderer.create(
      <ProfileDataTable profile={profile} editable={true} errors={{ mobile: 'error', email: 'error' }} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
