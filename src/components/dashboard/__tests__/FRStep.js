import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ResultStep from '../FaceVerification/components/ResultStep'

describe('ResultStep', () => {
  const WrappedResultStep = withThemeProvider(ResultStep)

  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedResultStep title={'Checking liveness'} isActive={true} status={true} isProcessFailed={false} />
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedResultStep title={'Checking liveness'} isActive={true} status={true} isProcessFailed={false} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
