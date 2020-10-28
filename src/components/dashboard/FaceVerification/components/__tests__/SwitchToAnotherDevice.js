import React from 'react'
import renderer from 'react-test-renderer'
import { noop } from 'lodash'

import ImportedSwitchToAnotherDevice from '../SwitchToAnotherDevice'
import { withThemeProvider } from '../../../../../__tests__/__util__'

describe('FaceVerification SwitchToAnotherDevice', () => {
  const SwitchToAnotherDevice = withThemeProvider(ImportedSwitchToAnotherDevice)
  const nav = { goToRoot: jest.fn(noop) }

  afterEach(() => {
    nav.goToRoot.mockReset()
  })

  it('renders without errors', () => {
    let tree

    expect(() => (tree = renderer.create(<SwitchToAnotherDevice nav={nav} />))).not.toThrow()
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<SwitchToAnotherDevice nav={nav} />)

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('should execute screenProps.goToRoot on "OK" press', () => {
    const tree = renderer.create(<SwitchToAnotherDevice nav={nav} />)
    const button = tree.root.findByProps({ testID: 'ok_button' })

    button.props.onPress()
    expect(nav.goToRoot).toHaveBeenCalled()
  })
})
