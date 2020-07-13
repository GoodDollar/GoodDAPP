import React from 'react'
import renderer from 'react-test-renderer'
import TabsView from '../TabsView'
import Dashboard from '../../dashboard/Dashboard'
import Profile from '../../profile/Profile'
import SimpleStore from '../../../lib/undux/SimpleStore'

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
      <SimpleStore.Container>
        <TabsView routes={routes} />
      </SimpleStore.Container>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <SimpleStore.Container>
        <TabsView routes={routes} />
      </SimpleStore.Container>,
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})
