import React from 'react'
import renderer from 'react-test-renderer'
import EventCounterParty from '../EventCounterParty'
import { mockEvent } from '../../__tests__/__util__'

describe('EventCounterParty', () => {
  describe('withdraw', () => {
    const feedItem = mockEvent('withdraw')

    it('renders without errors', () => {
      console.log({ feedItem })
      const tree = renderer.create(<EventCounterParty feedItem={feedItem} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      console.log({ feedItem })
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
