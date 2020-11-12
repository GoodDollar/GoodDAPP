import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ExplanationDialog from '../ExplanationDialog'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('ExplanationDialog', () => {
  const WrappedWrapper = withThemeProvider(ExplanationDialog)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedWrapper title="test" text="test" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedWrapper title="test" text="test" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
