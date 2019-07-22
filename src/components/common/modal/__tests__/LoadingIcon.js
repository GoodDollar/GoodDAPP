import React from 'react'
import renderer from 'react-test-renderer'
import ImportedLoadingIcon from '../LoadingIcon'
import { withThemeProvider } from '../../../../__tests__/__util__'
const LoadingIcon = withThemeProvider(ImportedLoadingIcon)

// Note: test renderer must be required after react-native.

describe('LoadingIcon', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<LoadingIcon />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<LoadingIcon />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
