import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import CustomDialog from '../CustomDialog'
import { Wrapper } from '../../index'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('CustomDialog', () => {
  const WrappedWrapper = withThemeProvider(Wrapper)
  it('renders without errors', () => {
    const tree = renderer.create(
      <WrappedWrapper>
        <CustomDialog>Next</CustomDialog>
      </WrappedWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <WrappedWrapper>
        <CustomDialog>Next</CustomDialog>
      </WrappedWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
