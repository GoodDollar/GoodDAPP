import React from 'react'
import renderer from 'react-test-renderer'
import EventCounterParty from '../EventCounterParty'
import { mockEvent } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('EventCounterParty', () => {
  const WrappedEventCounterParty = withThemeProvider(EventCounterParty)

  describe('withdraw', () => {
    const feedItem = mockEvent('withdraw')

    it('matches snapshot', async () => {
      let tree

      // eslint-disable-next-line require-await
      await renderer.act(async () => (tree = renderer.create(<WrappedEventCounterParty feedItem={feedItem} />)))
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })

  describe('send', () => {
    const feedItem = mockEvent('send')

    it('matches snapshot', async () => {
      let tree

      // eslint-disable-next-line require-await
      await renderer.act(async () => (tree = renderer.create(<WrappedEventCounterParty feedItem={feedItem} />)))
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })

  describe('receive', () => {
    const feedItem = mockEvent('receive')

    it('matches snapshot', async () => {
      let tree

      // eslint-disable-next-line require-await
      await renderer.act(async () => (tree = renderer.create(<WrappedEventCounterParty feedItem={feedItem} />)))
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })
})
