import React from 'react'
import FaceRecognition from '../FaceRecognition'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FaceRecognition', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<FaceRecognition screenProps={{}} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<FaceRecognition screenProps={{}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
