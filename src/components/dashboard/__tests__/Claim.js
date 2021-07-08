import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

const screenState = {
  isValid: true,
}

describe('Claim', () => {
  it('renders without errors', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim', { screenProps: { screenState } })
    let component
    renderer.act(() => (component = renderer.create(<Claim />)))
    const tree = component.toJSON()
    expect(tree).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim', { screenProps: { screenState } })
    let component
    renderer.act(() => (component = renderer.create(<Claim />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
