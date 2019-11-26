import React from 'react'
import renderer from 'react-test-renderer'
import ImportedIconWrapper from '../IconWrapper'
import { withThemeProvider } from '../../../../__tests__/__util__'
const IconWrapper = withThemeProvider(ImportedIconWrapper)

// Note: test renderer must be required after react-native.

describe('IconWrapper', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IconWrapper />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IconWrapper />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
