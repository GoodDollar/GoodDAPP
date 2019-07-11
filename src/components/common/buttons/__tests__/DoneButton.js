import React from 'react'

import renderer from 'react-test-renderer'
import DoneButton from '../DoneButton'

// Note: test renderer must be required after react-native.

describe('DoneButton', () => {
  const screenProps = { goToRoot: () => null }
  it('renders without errors', () => {
    const tree = renderer.create(<DoneButton screenProps={screenProps}>Next</DoneButton>)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<DoneButton screenProps={screenProps}>Next</DoneButton>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
