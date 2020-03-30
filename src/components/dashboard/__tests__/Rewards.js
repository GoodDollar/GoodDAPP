import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import Rewards from '../Rewards'

describe('Rewards', () => {
  const WrappedRewards = withThemeProvider(Rewards)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedRewards />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedRewards />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
