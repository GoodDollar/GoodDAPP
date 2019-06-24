import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

// eslint-disable-next-line flowtype/no-types-missing-file-annotation
declare var ZoomSDK: any

// Note: test renderer must be required after react-native.
describe('FaceRecognition Rendering', () => {
  it('renders without errors', () => {
    global.ZoomSDK = {}
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
