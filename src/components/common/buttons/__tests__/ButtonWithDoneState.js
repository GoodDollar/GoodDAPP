import React from 'react'

import renderer from 'react-test-renderer'
import ImportedDoneButton from '../ButtonWithDoneState'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ButtonWithDoneState = withThemeProvider(ImportedDoneButton)

// Note: test renderer must be required after react-native.

describe('DoneButton', () => {
  const screenProps = { goToRoot: () => null }
  it('renders without errors', () => {
    const tree = renderer.create(<ButtonWithDoneState screenProps={screenProps}>Next</ButtonWithDoneState>)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ButtonWithDoneState screenProps={screenProps}>Next</ButtonWithDoneState>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
