import React from 'react'
import renderer from 'react-test-renderer'
import zoomSdkLoader from '../FaceRecognition/ZoomSdkLoader'
import * as ZoomSDK from '../FaceRecognition/FaceRecognition'

import { getWebRouterComponentWithMocks } from './__util__'
// Note: test renderer must be required after react-native.
describe('FaceRecognition Rendering', () => {
  beforeAll(async done => {
    await zoomSdkLoader.load()
    window.ZoomSDK = ZoomSDK
    done()
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
