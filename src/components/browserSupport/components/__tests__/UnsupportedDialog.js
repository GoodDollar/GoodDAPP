import React from 'react'
import { noop } from 'lodash'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import UnsupportedDialog from '../UnsupportedDialog'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('UnsupportedDialog', () => {
  const WrappedComponent = withThemeProvider(UnsupportedDialog)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedComponent onDissmiss={noop} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedComponent onDissmiss={noop} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
