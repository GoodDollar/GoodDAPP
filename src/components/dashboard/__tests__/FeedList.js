import React from 'react'
import FeedList from '../FeedList'
import { generateEvent } from '../../../lib/share'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FeedList', () => {
  let props = {
    fixedHeight: true,
    virtualized: true,
    updateData: () => {},
    onEndReached: () => {}
  }

  describe('Horizontal rendering', () => {
    beforeEach(() => {
      props.horizontal = true
    })

    describe('With empty data', () => {
      beforeEach(() => {
        props.data = []
      })

      it('renders without errors', () => {
        const tree = renderer.create(<FeedList {...props} />)
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(<FeedList {...props} />)
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('With feed data', () => {
      beforeEach(() => {
        props.data = [
          { ...generateEvent('withdraw').item },
          {
            ...generateEvent('send').item,
            id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f88'
          }
        ]
      })

      it('renders without errors', () => {
        const tree = renderer.create(<FeedList {...props} />)
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(<FeedList {...props} />)
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })

  describe('Vertical rendering', () => {
    beforeEach(() => {
      props.horizontal = false
    })

    describe('With empty data', () => {
      beforeEach(() => {
        props.data = []
      })

      it('renders without errors', () => {
        const tree = renderer.create(<FeedList {...props} />)
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(<FeedList {...props} />)
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })

    describe('With feed data', () => {
      beforeEach(() => {
        props.data = [
          { ...generateEvent('withdraw').item },
          {
            ...generateEvent('send').item,
            id: '0x9812619905da200c4effe8cd2ca4b2b31eeddf133f8fd283069d2e5aec3b9f88'
          }
        ]
      })

      it('renders without errors', () => {
        const tree = renderer.create(<FeedList {...props} />)
        expect(tree.toJSON()).toBeTruthy()
      })

      it('matches snapshot', () => {
        const component = renderer.create(<FeedList {...props} />)
        const tree = component.toJSON()
        expect(tree).toMatchSnapshot()
      })
    })
  })
})
