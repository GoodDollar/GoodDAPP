import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { Provider as PaperProvider } from 'react-native-paper'
import { theme } from '../../../theme/styles'
import CustomDialog from '../CustomDialog'
import { Wrapper } from '../../index'

describe('CustomDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <Wrapper>
          <CustomDialog>Next</CustomDialog>
        </Wrapper>
      </PaperProvider>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <Wrapper>
          <CustomDialog>Next</CustomDialog>
        </Wrapper>
      </PaperProvider>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
