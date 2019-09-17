import React from 'react'
import renderer from 'react-test-renderer'
import EmptyEventFeed from '../EmptyEventFeed'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('FeedbackModalItem', () => {
  const WrappedEmptyEventFeed = withThemeProvider(EmptyEventFeed)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedEmptyEventFeed />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedEmptyEventFeed />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
