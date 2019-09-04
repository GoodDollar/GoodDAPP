import React from 'react'

// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import FeedModalItem from '../FeedModalItem'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('FeedModalItem - Withdraw', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedFeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedFeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('send')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedFeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedFeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send with Error status', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('send', 'error')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedFeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedFeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Message', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('message')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedFeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedFeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Invite', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('invite')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedFeedModalItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedFeedModalItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
