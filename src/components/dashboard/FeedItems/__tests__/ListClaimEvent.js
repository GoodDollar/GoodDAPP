import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ListClaimEvent from '../ListClaimEvent'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ListClaimEvent', () => {
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<ListClaimEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ListClaimEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
