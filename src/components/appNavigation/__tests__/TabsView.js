import React from 'react'
import TabsView from '../TabsView'
import Dashboard from '../../dashboard/Dashboard'
import Profile from '../../profile/Profile'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('TabsView', () => {
  const routes = {
    Dashboard: {
      screen: Dashboard
    },
    Profile: {
      screen: Profile
    }
  }

  it('renders without errors', () => {
    const tree = renderer.create(<TabsView routes={routes} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<TabsView routes={routes} />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
