import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import IOSDialog from '../IOS'

describe('IOSUnsupportedBrowserDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IOSDialog />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IOSDialog />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
