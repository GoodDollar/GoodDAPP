import React from 'react'
import renderer from 'react-test-renderer'
import BigGoodDollar from '../BigGoodDollar'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('BigGoodDollar', () => {
  const WrappedBigGoodDollar = withThemeProvider(BigGoodDollar)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedBigGoodDollar number={1005} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
