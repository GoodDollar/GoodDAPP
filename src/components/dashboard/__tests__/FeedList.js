import React from 'react'
import renderer from 'react-test-renderer'
import FeedList from '../FeedList'
import { mockEvent } from '../__tests__/__util__'
import { withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('FeedList', () => {
  const WrappedFeedList = withThemeProvider(FeedList)
  let props = {
    updateData: () => {},
    onEndReached: () => {},
  }

  describe('Vertical rendering', () => {
    describe('With empty data', () => {
      beforeEach(() => {
        props.data = []
      })

      it('matches snapshot', async () => {
        let component

        // eslint-disable-next-line require-await
        await renderer.act(async () => (component = renderer.create(<WrappedFeedList {...props} />)))
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('With feed data', () => {
      beforeEach(() => {
        props.data = [
          { ...mockEvent('withdraw'), id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f8a' },
          {
            ...mockEvent('send'),
            id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f88',
          },
        ]
      })

      it('matches snapshot', async () => {
        let component

        // eslint-disable-next-line require-await
        await renderer.act(async () => (component = renderer.create(<WrappedFeedList {...props} />)))
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
