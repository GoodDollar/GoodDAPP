import React from 'react'
import renderer from 'react-test-renderer'
import EmptyEventFeed from '../EmptyEventFeed'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('FeedbackModalItem', () => {
  const WrappedEmptyEventFeed = withThemeProvider(EmptyEventFeed)

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedEmptyEventFeed />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
