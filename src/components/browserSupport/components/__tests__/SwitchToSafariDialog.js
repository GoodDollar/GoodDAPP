import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import SwitchToSafariDialog from '../SwitchToSafariDialog'

describe('SwitchToSafariDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SwitchToSafariDialog />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SwitchToSafariDialog />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
