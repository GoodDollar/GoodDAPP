import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import Marketplace from '../Marketplace.web'

describe('Rewards', () => {
  const WrappedMarketplace = withThemeProvider(Marketplace)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedMarketplace />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedMarketplace />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
