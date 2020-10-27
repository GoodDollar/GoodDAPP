import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedSwitchToAnotherDevice from '../SwitchToAnotherDevice'

const SwitchToAnotherDevice = withThemeProvider(ImportedSwitchToAnotherDevice)
const screenProps = { goToRoot: jest.fn(() => {}) }

describe('FaceVerification SwitchToAnotherDevice', () => {
  it('renders without errors', () => {
    let tree

    expect(() => (tree = renderer.create(<SwitchToAnotherDevice screenProps={screenProps} />))).not.toThrow()
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<SwitchToAnotherDevice screenProps={screenProps} />)

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('should execute screenProps.goToRoot on "OK" press', () => {
    const tree = renderer.create(<SwitchToAnotherDevice screenProps={screenProps} />)
    const button = tree.root.findByProps({ testID: 'ok_button' })

    button.props.onPress()
    expect(screenProps.goToRoot).toHaveBeenCalled()
  })
})
