import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ListEventItem from '../ListEventItem'
import { generateFeedItemProps } from '../../__tests__/__util__'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('ListEventItem', () => {
  const WrappedListEventItem = withThemeProvider(ListEventItem)
  describe('withdraw', () => {
    const props = generateFeedItemProps('withdraw')

    it('matches snapshot', async () => {
      let component

      // eslint-disable-next-line require-await
      await renderer.act(async () => (component = renderer.create(<WrappedListEventItem {...props} />)))
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('receive', () => {
    const props = generateFeedItemProps('receive')

    it('matches snapshot', async () => {
      let component

      // eslint-disable-next-line require-await
      await renderer.act(async () => (component = renderer.create(<WrappedListEventItem {...props} />)))
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('send', () => {
    const props = generateFeedItemProps('send')

    it('matches snapshot', async () => {
      let component

      // eslint-disable-next-line require-await
      await renderer.act(async () => (component = renderer.create(<WrappedListEventItem {...props} />)))
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
