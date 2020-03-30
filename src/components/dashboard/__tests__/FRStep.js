import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import FRStep from '../FaceVerification/components/FRStep'

describe('FRStep', () => {
  const WrappedFRStep = withThemeProvider(FRStep)

  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedFRStep title={'Checking liveness'} isActive={true} status={true} isProcessFailed={false} />
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedFRStep title={'Checking liveness'} isActive={true} status={true} isProcessFailed={false} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
