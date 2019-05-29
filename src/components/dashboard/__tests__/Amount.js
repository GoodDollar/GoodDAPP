import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('Amount', () => {
  it('renders without errors', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const tree = renderer.create(<Amount />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const component = renderer.create(<Amount />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
