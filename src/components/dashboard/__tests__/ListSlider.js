import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('ListSlider', () => {
  const data = [
    {
      title: 'Item 1',
      key: '1'
    },
    {
      title: 'Item 2',
      key: '2'
    }
  ]

  it('renders without errors', () => {
    const ListSlider = getWebRouterComponentWithMocks('../ListSlider')
    const tree = renderer.create(<ListSlider data={data} title="Test" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ListSlider = getWebRouterComponentWithMocks('../ListSlider')
    const component = renderer.create(<ListSlider data={data} title="Test" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
