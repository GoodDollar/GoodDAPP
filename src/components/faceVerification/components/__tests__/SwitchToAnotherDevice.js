import React from 'react'
import renderer from 'react-test-renderer'
import { noop } from 'lodash'

import ImportedSwitchToAnotherDevice from '../SwitchToAnotherDevice'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('FaceVerification SwitchToAnotherDevice', () => {
  const SwitchToAnotherDevice = withThemeProvider(ImportedSwitchToAnotherDevice)
  const nav = { goToRoot: jest.fn(noop) }

  afterEach(() => {
    nav.goToRoot.mockReset()
  })

  it('matches snapshot', async () => {
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<SwitchToAnotherDevice nav={nav} />)))

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('should execute screenProps.goToRoot on "OK" press', async () => {
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<SwitchToAnotherDevice nav={nav} />)))
    const button = tree.root.findByProps({ testID: 'ok_button' })

    button.props.onPress()
    expect(nav.goToRoot).toHaveBeenCalled()
  })
})
