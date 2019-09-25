import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ZoomCapture from '../FaceRecognition/ZoomCapture'

describe('ZoomCapture', () => {
  const Wrapped = withThemeProvider(ZoomCapture)

  it('renders without errors', () => {
    const tree = renderer.create(<Wrapped />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Wrapped />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
