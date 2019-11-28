import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('OutOfGasError', () => {
  it('renders without errors', () => {
    const SendQRSummary = getWebRouterComponentWithMocks('../SendQRSummary')
    let component
    renderer.act(() => (component = renderer.create(<SendQRSummary />)))
    const tree = component.toJSON()
    expect(tree).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendQRSummary = getWebRouterComponentWithMocks('../SendQRSummary')
    let component
    renderer.act(() => (component = renderer.create(<SendQRSummary />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
