import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('SurveySend', () => {
  it('renders without errors', () => {
    const SurveySend = getWebRouterComponentWithMocks('../SurveySend')
    const tree = renderer.create(<SurveySend />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SurveySend = getWebRouterComponentWithMocks('../SurveySend')
    const component = renderer.create(<SurveySend />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
