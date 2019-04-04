import React from 'react'
import ModalSendEvent from '../ModalSendEvent'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('ModalSendEvent', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalSendEvent />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalSendEvent />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
