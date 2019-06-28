import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import CustomDialog from '../CustomDialog'
import { Wrapper } from '../../index'

describe('CustomDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <Wrapper>
        <CustomDialog>Next</CustomDialog>
      </Wrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <Wrapper>
        <CustomDialog>Next</CustomDialog>
      </Wrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
