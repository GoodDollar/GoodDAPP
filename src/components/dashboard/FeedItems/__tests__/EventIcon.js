import React from 'react'
import renderer from 'react-test-renderer'
import EventIcon from '../EventIcon'

// Note: test renderer must be required after react-native.

describe('EventIcon - Withdraw', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<EventIcon type="withdraw" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<EventIcon type="withdraw" />)
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('EventIcon - Send', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<EventIcon type="send" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<EventIcon type="send" />)
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('EventIcon - Receive', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<EventIcon type="receive" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<EventIcon type="receive" />)
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
