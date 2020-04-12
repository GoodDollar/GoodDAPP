import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import UnsupportedScreen from '../screens/UnsupportedScreen'

describe('ResultStep', () => {
  const WrappedUnsupportedScreen = withThemeProvider(UnsupportedScreen)

  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedUnsupportedScreen title={'Checking liveness'} screenProps={{ screenState: { reason: 'Test' } }} />
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedUnsupportedScreen title={'Checking liveness'} screenProps={{ screenState: { reason: 'Test' } }} />
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
