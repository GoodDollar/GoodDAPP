import React from 'react'
import renderer from 'react-test-renderer'
import ImportedTabsView from '../TabsView'
import Dashboard from '../../dashboard/Dashboard'
import Profile from '../../profile/Profile'
import userStorage from '../../../lib/userStorage/UserStorage'
import { withStoresProvider } from '../../../__tests__/__util__/index'

// Note: test renderer must be required after react-native.
jest.setTimeout(30000)

describe('TabsView', () => {
  beforeAll(async () => {
    await userStorage.wallet.ready
    await userStorage.ready
  })

  const routes = {
    Dashboard: {
      screen: Dashboard,
    },
    Profile: {
      screen: Profile,
    },
  }

  const TabsView = withStoresProvider(ImportedTabsView)

  it('renders without errors', () => {
    const tree = renderer.create(<TabsView routes={routes} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<TabsView routes={routes} />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
