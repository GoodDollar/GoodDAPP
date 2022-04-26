import React from 'react'
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(30000)
describe('SendLinkSummary', () => {
  it('matches snapshot', async () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<SendLinkSummary />)))
    tree = tree.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
