import React from 'react'
import renderer from 'react-test-renderer'
import FeedList from '../FeedList'
import { mockEvent } from '../__tests__/__util__'
import GDStore from '../../../lib/undux/GDStore'
import { withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.
const { Container } = GDStore

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

      it('renders without errors', () => {
        const tree = renderer.create(
          <Container>
            <WrappedFeedList {...props} />
          </Container>
        )
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(
          <Container>
            <WrappedFeedList {...props} />
          </Container>
        )
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

      it('renders without errors', () => {
        const tree = renderer.create(
          <Container>
            <WrappedFeedList {...props} />
          </Container>
        )
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(
          <Container>
            <WrappedFeedList {...props} />
          </Container>
        )
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
