import React from 'react'
import renderer from 'react-test-renderer'
import BigNumber from '../BigNumber'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('BigNumber', () => {
  const WrappedBigNumber = withThemeProvider(BigNumber)
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedBigNumber number={10} unit="G$" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedBigNumber number={10} unit="G$" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
