import React from 'react'
import renderer from 'react-test-renderer'
import TabsView from '../TabsView'
import Dashboard from '../../dashboard/Dashboard'
import Profile from '../../profile/Profile'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

// Note: test renderer must be required after react-native.

describe('TabsView', () => {
  const routes = {
    Dashboard: {
      screen: Dashboard,
    },
    Profile: {
      screen: Profile,
    },
  }

  it('renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <TabsView routes={routes} />
      </StoresWrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <TabsView routes={routes} />
      </StoresWrapper>
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})
