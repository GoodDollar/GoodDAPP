import React from 'react'
import FeedListItem from '../FeedListItem'
import { generateFeedItemProps } from '../../__tests__/__util__'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FeedListItem - Withdraw', () => {
  const props = generateFeedItemProps('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedListItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedListItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedListItem - Send', () => {
  const props = generateFeedItemProps('send')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedListItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedListItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
