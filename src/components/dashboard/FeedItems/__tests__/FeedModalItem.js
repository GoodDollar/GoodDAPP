import React from 'react'
import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FeedModalItem - Withdraw', () => {
  const FeedModalWithdraw = getComponentWithMock('../FeedModalItem', 'withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedModalWithdraw />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedModalWithdraw />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send', () => {
  const FeedModalSend = getComponentWithMock('../FeedModalItem', 'send')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedModalSend />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedModalSend />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
