import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('FaceRecognition', () => {
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
