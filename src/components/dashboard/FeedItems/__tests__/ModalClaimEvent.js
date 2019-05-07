import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ModalClaimEvent from '../ModalClaimEvent'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ModalClaimEvent', () => {
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<ModalClaimEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalClaimEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
