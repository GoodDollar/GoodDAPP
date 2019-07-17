import React from 'react'
import renderer from 'react-test-renderer'
import AmountInput from '../AmountInput'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('AmountInput', () => {
  const WrappedAmountInput = withThemeProvider(AmountInput)

  let amount = '14'
  const handleAmountChange = value => {
    amount = value
  }

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedAmountInput handleAmountChange={handleAmountChange} amount={amount} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedAmountInput handleAmountChange={handleAmountChange} amount={amount} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
