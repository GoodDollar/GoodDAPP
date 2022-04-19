import React from 'react'
import renderer from 'react-test-renderer'
import FeedListItem from '../FeedListItem'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('FeedListItem - Withdraw', () => {
  const WrappedFeedListItem = withThemeProvider(FeedListItem)
  const props = generateFeedItemProps('withdraw')

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedFeedListItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedListItem - Send', () => {
  const WrappedFeedListItem = withThemeProvider(FeedListItem)
  const props = generateFeedItemProps('send')

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedFeedListItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
