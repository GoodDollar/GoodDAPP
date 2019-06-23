import React from 'react'
import renderer from 'react-test-renderer'
import zoomSdkLoader from '../FaceRecognition/ZoomSdkLoader'
import { getWebRouterComponentWithMocks } from './__util__'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('FaceRecognition Rendering', () => {
  beforeAll(async () => {
    await zoomSdkLoader.load()
  })
  it('renders without errors', () => {
    const FaceRecognition = getWebRouterComponentWithMocks('../FaceRecognition/FaceRecognition')
    const tree = renderer.create(<FaceRecognition />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const FaceRecognition = getWebRouterComponentWithMocks('../FaceRecognition/FaceRecognition')
    const component = renderer.create(<FaceRecognition />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
