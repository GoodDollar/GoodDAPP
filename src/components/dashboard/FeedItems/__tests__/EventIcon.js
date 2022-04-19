import React from 'react'
import renderer from 'react-test-renderer'
import EventIcon from '../EventIcon'

// Note: test renderer must be required after react-native.

describe('EventIcon - Withdraw', () => {
  it('matches snapshot', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<EventIcon type="withdraw" />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('EventIcon - Send', () => {
  it('matches snapshot', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<EventIcon type="send" />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('EventIcon - Receive', () => {
  it('matches snapshot', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<EventIcon type="receive" />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})

describe('EventIcon - welcome', () => {
  it('matches snapshot', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<EventIcon type="welcome" />)))
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
