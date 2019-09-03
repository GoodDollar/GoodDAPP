import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import SendModalItemWithError from '../SendModalItemWithError'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('SendModalItemWithError', () => {
  const WrappedSendModalItemWithError = withThemeProvider(SendModalItemWithError)
  const props = generateFeedItemProps('send', 'error')
  it('renders without errors', () => {
    const tree = renderer.create(<WrappedSendModalItemWithError {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedSendModalItemWithError {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
