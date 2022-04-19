import React from 'react'
import renderer from 'react-test-renderer'
import FeedModalList from '../FeedModalList'
import { mockEvent } from '../__tests__/__util__'
import { withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('FeedModalList', () => {
  const WrappedFeedModalList = withThemeProvider(FeedModalList)
  let props = {
    updateData: () => {},
    onEndReached: () => {},
  }

  describe('Horizontal rendering', () => {
    describe('With empty data', () => {
      beforeEach(() => {
        props.data = []
      })

      it('matches snapshot', async () => {
        let component
        await renderer.act(async () => (component = renderer.create(<WrappedFeedModalList {...props} />)))
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('With feed data', () => {
      beforeEach(() => {
        props.data = [
          { ...mockEvent('withdraw') },
          {
            ...mockEvent('send'),
            id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f88',
          },
        ]
      })

      it('matches snapshot', async () => {
        let component
        await renderer.act(async () => (component = renderer.create(<WrappedFeedModalList {...props} />)))
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
