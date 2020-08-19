import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import SwitchToChromeOrSafari from '../SwitchToChromeOrSafari'

describe('SwitchToChromeOrSafari', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SwitchToChromeOrSafari />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SwitchToChromeOrSafari />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
