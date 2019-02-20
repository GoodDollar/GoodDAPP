import React from 'react'
import TopBar from '../TopBar'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('TopBar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<TopBar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot without balance', () => {
    const component = renderer.create(<TopBar />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with balance', () => {
    const component = renderer.create(<TopBar balance={10} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
