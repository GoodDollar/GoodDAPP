import React from 'react'
import renderer from 'react-test-renderer'
import ImportedErrorIcon from '../ErrorIcon'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ErrorIcon = withThemeProvider(ImportedErrorIcon)

// Note: test renderer must be required after react-native.

describe('ErrorIcon', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ErrorIcon />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ErrorIcon />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
