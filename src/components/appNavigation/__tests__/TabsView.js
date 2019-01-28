import React from 'react'
import TabsView from '../TabsView'
import Rewards from '../Rewards'
import BuySell from '../BuySell'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('TabsView', () => {
  const routes = {
    Rewards: {
      screen: Rewards
    },
    BuySell: {
      screen: BuySell
    }
  }

  it('renders without errors', () => {
    const tree = renderer.create(<TabsView routes={routes} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it.only('matches snapshot', () => {
    const component = renderer.create(<TabsView routes={routes} />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
