import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('ModalSlider', () => {
  it('renders without errors', () => {
    const ModalSlider = getWebRouterComponentWithMocks('../ModalSlider')
    const tree = renderer.create(<ModalSlider visible title="Test" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ModalSlider = getWebRouterComponentWithMocks('../ModalSlider')
    const component = renderer.create(<ModalSlider visible={false} title="Test" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
