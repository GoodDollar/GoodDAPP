import React from 'react'
import { generateEvent } from '../../../../lib/share'
import FeedListItem from '../FeedListItem'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FeedListItem - Withdraw', () => {
  const props = generateEvent('withdraw')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedListItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedListItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('FeedListItem - Send', () => {
  const props = generateEvent('send')
  it('renders without errors', () => {
    const tree = renderer.create(<FeedListItem {...props} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FeedListItem {...props} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
