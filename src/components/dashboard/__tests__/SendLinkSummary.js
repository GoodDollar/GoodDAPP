import React from 'react'
import { getWebRouterComponentWithMocks } from './utils'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('SendLinkSummary', () => {
  it('renders without errors', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const tree = renderer.create(<SendLinkSummary />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const component = renderer.create(<SendLinkSummary />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
