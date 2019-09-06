import React from 'react'
import renderer from 'react-test-renderer'
import Circle from '../Circle'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('Circle', () => {
  const WrappedCircle = withThemeProvider(Circle)

  it('renders without errors', () => {
    const component = renderer.create(<WrappedCircle number={10}> Test text</WrappedCircle>)
    expect(component.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedCircle number={10}> Test text</WrappedCircle>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
