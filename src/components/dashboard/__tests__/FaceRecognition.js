//@flow
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'
import { getWebRouterComponentWithMocks } from './__util__'

jest.mock('../FaceRecognition/ZoomSdkLoader', () => ({
  ready: Promise.resolve(),
}))

declare var ZoomSDK: any

// Note: test renderer must be required after react-native.
describe('FaceRecognition Rendering', () => {
  it('renders without errors', () => {
    global.ZoomSDK = {}
    const FaceRecognition = getWebRouterComponentWithMocks('../FaceRecognition/FaceRecognition')
    const tree = renderer.create(
      <StoresWrapper>
        <FaceRecognition />
      </StoresWrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const FaceRecognition = getWebRouterComponentWithMocks('../FaceRecognition/FaceRecognition')
    const component = renderer.create(
      <StoresWrapper>
        <FaceRecognition />
      </StoresWrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
