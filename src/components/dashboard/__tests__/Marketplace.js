import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import Marketplace from '../Marketplace.web'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'

let WrappedMarketplace
describe('Marketplace', () => {
  jest.setTimeout(100000)
  beforeAll(async () => {
    await goodWallet.ready
    await userStorage.ready
    WrappedMarketplace = withThemeProvider(Marketplace)
  })

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
