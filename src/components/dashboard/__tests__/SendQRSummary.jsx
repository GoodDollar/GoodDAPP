// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(30000)

describe('SendQRSummary', () => {
  it('matches snapshot', async () => {
    const SendQRSummary = getWebRouterComponentWithMocks('../SendQRSummary')
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<SendQRSummary />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
