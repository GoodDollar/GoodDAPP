import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import FeedbackModalItem from '../FeedbackModalItem'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('FeedbackModalItem', () => {
  const WrappedFeedbackModalItem = withThemeProvider(FeedbackModalItem)
  const props = generateFeedItemProps('feedback')

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedFeedbackModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
