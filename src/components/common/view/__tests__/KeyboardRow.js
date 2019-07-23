import React from 'react'
import renderer from 'react-test-renderer'
import KeyboardRow from '../KeyboardRow'

import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('KeyboardRow', () => {
  const WrappedKeyboardRow = withThemeProvider(KeyboardRow)
  const keys = ['1', '2', '3']

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedKeyboardRow keys={keys} onPress={() => {}} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedKeyboardRow keys={keys} onPress={() => {}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
