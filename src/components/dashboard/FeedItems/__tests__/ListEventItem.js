import React from 'react'
import renderer from 'react-test-renderer'
import ListEventItem from '../ListEventItem'
import { generateFeedItemProps } from '../../__tests__/__util__'

describe('ListEventItem', () => {
  describe('withdraw', () => {
    const props = generateFeedItemProps('withdraw')
    it('renders without errors', () => {
      const tree = renderer.create(<ListEventItem {...props} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      const component = renderer.create(<ListEventItem {...props} />)
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('receive', () => {
    const props = generateFeedItemProps('receive')
    it('renders without errors', () => {
      const tree = renderer.create(<ListEventItem {...props} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      const component = renderer.create(<ListEventItem {...props} />)
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('send', () => {
    const props = generateFeedItemProps('send')
    it('renders without errors', () => {
      const tree = renderer.create(<ListEventItem {...props} />)
      expect(tree.toJSON()).toBeTruthy()
    })

    it('matches snapshot', () => {
      const component = renderer.create(<ListEventItem {...props} />)
      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
