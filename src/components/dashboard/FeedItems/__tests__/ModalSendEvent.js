import React from 'react'
// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ModalSendEvent from '../ModalSendEvent'
import { generateEvent } from '../../../../lib/share'

describe('ModalSendEvent', () => {
  // const ModalSendEvent = getComponentWithMock('../ModalSendEvent', 'send')
  const props = generateEvent('send')
  it('renders without errors', () => {
    const tree = renderer.create(<ModalSendEvent {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalSendEvent {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
