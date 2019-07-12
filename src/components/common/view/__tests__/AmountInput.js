import React from 'react'
import renderer from 'react-test-renderer'
import AmountInput from '../AmountInput'

describe('AmountInput', () => {
  let amount = '14'
  const handleAmountChange = value => {
    amount = value
  }

  it('renders without errors', () => {
    const tree = renderer.create(<AmountInput handleAmountChange={handleAmountChange} amount={amount} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<AmountInput handleAmountChange={handleAmountChange} amount={amount} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
