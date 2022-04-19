import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import FeedActions from '../FeedActions'

// Note: test renderer must be required after react-native.

describe('FeedActions', () => {
  const WrappedFeedActions = withThemeProvider(FeedActions)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedFeedActions />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
