import React from 'react'
import renderer from 'react-test-renderer'
import KeyboardKey from '../KeyboardKey'

import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('KeyboardKey', () => {
  const WrappedKeyboardKey = withThemeProvider(KeyboardKey)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedKeyboardKey keyValue="1" onPress={() => {}} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedKeyboardKey keyValue="1" onPress={() => {}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
