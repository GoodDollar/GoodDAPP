import React from 'react'
// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ModalWithdrawEvent from '../ModalWithdrawEvent'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ModalWithdrawEvent', () => {
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<ModalWithdrawEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalWithdrawEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
