import React from 'react'
import renderer from 'react-test-renderer'
import EventCounterParty from '../EventCounterParty'
import { mockEvent } from '../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('EventCounterParty', () => {
  describe('withdraw', () => {
    const feedItem = mockEvent('withdraw')

    it('renders without errors', () => {
      console.info({ feedItem })
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      console.info({ feedItem })
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })

  describe('send', () => {
    const feedItem = mockEvent('send')

    it('renders without errors', () => {
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })

  describe('receive', () => {
    const feedItem = mockEvent('receive')

    it('renders without errors', () => {
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toMatchSnapshot()
    })
  })
})
