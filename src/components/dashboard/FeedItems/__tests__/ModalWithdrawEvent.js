import React from 'react'
import ModalWithdrawEvent from '../ModalWithdrawEvent'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('ModalWithdrawEvent', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalWithdrawEvent />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalWithdrawEvent />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
