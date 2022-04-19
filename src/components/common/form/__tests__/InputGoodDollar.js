import React from 'react'
import renderer from 'react-test-renderer'
import InputGoodDollar from '../InputGoodDollar'

import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('InputGoodDollar', () => {
  const WrappedInputGoodDollar = withThemeProvider(InputGoodDollar)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedInputGoodDollar wei={12002} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () => (component = renderer.create(<WrappedInputGoodDollar wei={12002} error="error message" />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
