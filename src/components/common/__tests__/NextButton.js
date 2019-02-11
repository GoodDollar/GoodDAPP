import React from 'react'
import NextButton from '../NextButton'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('NextButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<NextButton />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<NextButton>Next</NextButton>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
