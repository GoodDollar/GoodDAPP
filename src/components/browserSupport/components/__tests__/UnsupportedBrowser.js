import React from 'react'
import { noop } from 'lodash'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import UnsupportedBrowser from '../UnsupportedBrowser'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('UnsupportedBrowser', () => {
  const WrappedComponent = withThemeProvider(UnsupportedBrowser)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedComponent onDissmiss={noop} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
