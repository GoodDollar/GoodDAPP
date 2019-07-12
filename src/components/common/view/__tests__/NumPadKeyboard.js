import React from 'react'
import renderer from 'react-test-renderer'
import NumPadKeyboard from '../NumPadKeyboard'

import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('NumPadKeyboard', () => {
  const WrappedNumPadKeyboard = withThemeProvider(NumPadKeyboard)

  let amount = 14
  const handleAmountChange = value => {
    amount = value
  }

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedNumPadKeyboard onPress={handleAmountChange} amount={amount} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedNumPadKeyboard onPress={handleAmountChange} amount={amount} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
