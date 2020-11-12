import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import SwitchToChromeOrSafari from '../SwitchToChromeOrSafari'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('SwitchToChromeOrSafari', () => {
  const WrappedComponent = withThemeProvider(SwitchToChromeOrSafari)
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedComponent />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedComponent />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
