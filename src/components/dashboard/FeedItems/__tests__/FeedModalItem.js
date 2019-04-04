import React from 'react'
// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import { generateEvent } from '../../../../lib/share'
import renderer from 'react-test-renderer'
import FeedModalItem from '../FeedModalItem'

describe('FeedModalItem - Withdraw', () => {
  // const FeedModalWithdraw = getComponentWithMock('../FeedModalItem', 'withdraw')
  const props = generateEvent('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send', () => {
  // const FeedModalSend = getComponentWithMock('../FeedModalItem', 'send')
  const props = generateEvent('send')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
