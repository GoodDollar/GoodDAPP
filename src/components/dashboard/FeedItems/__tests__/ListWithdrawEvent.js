import React from 'react'
// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ListWithdrawEvent from '../ListWithdrawEvent'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ListWithdrawEvent', () => {
  // const ListWithdrawEvent = getComponentWithMock('../ListWithdrawEvent', 'withdraw')
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<ListWithdrawEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ListWithdrawEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
