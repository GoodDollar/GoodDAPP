import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import SendModalItemWithError from '../SendModalItemWithError'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'
import userStorage from '../../../../lib/userStorage/UserStorage'

jest.setTimeout(30000)

describe('SendModalItemWithError', () => {
  beforeAll(async () => {
    await userStorage.wallet.ready
    await userStorage.ready
  })
  const WrappedSendModalItemWithError = withThemeProvider(SendModalItemWithError)
  const props = generateFeedItemProps('send', 'error')

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedSendModalItemWithError {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
