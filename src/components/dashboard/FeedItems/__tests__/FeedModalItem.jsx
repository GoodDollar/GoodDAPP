import React from 'react'

// import { getComponentWithMock } from './__util__/index'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import FeedModalItem from '../FeedModalItem'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'
import userStorage from '../../../../lib/userStorage/UserStorage'

jest.setTimeout(30000)

describe('FeedModalItem - Withdraw', () => {
  beforeAll(async () => {
    await userStorage.wallet.ready
    await userStorage.ready
  })

  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('withdraw')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedFeedModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('send')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedFeedModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Send with Error status', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('send', 'error')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedFeedModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Message', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('message')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedFeedModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedModalItem - Invite', () => {
  const WrappedFeedModalItem = withThemeProvider(FeedModalItem)
  const props = generateFeedItemProps('invite')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedFeedModalItem {...props} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
