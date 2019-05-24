import React from 'react'
import EmailConfirmationError from '../EmailConfirmationError'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Address', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<EmailConfirmationError />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<EmailConfirmationError />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
