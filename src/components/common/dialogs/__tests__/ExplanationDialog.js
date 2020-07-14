import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ExplanationDialog from '../ExplanationDialog'

describe('ExplanationDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ExplanationDialog title="test" text="test" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ExplanationDialog title="test" text="test" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
