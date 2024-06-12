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

  it('matches snapshot', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(<WrappedAmountInput handleAmountChange={handleAmountChange} amount={amount} />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
