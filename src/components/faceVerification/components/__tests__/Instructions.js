import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedInstructions from '../Instructions'

const Instructions = withThemeProvider(ImportedInstructions)

describe('FaceVerification Instructions', () => {
  it('matches snapshot', async () => {
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<Instructions ready={true} />)))

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('should execute onDismiss on "GOT IT" press', async () => {
    const onDismiss = jest.fn(() => {})
    let tree

    // eslint-disable-next-line require-await
    await renderer.act(async () => (tree = renderer.create(<Instructions onDismiss={onDismiss} ready={true} />)))

    const button = tree.root.findByProps({ testID: 'dismiss_button' })

    button.props.onPress()
    expect(onDismiss).toHaveBeenCalled()
  })
})
