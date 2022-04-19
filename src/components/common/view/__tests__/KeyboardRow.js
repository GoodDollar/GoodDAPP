import React from 'react'
import renderer from 'react-test-renderer'
import KeyboardRow from '../KeyboardRow'

import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('KeyboardRow', () => {
  const WrappedKeyboardRow = withThemeProvider(KeyboardRow)
  const keys = ['1', '2', '3']

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedKeyboardRow keys={keys} onPress={() => {}} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
