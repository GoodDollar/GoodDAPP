import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedInstructions from '../Instructions'

const Instructions = withThemeProvider(ImportedInstructions)

describe('FaceVerification Instructions', () => {
  it('renders without errors', () => {
    let tree

    expect(() => (tree = renderer.create(<Instructions />))).not.toThrow()
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<Instructions />)

    expect(tree.toJSON()).toMatchSnapshot()
  })

  it('should execute onDismiss on "GOT IT" press', () => {
    const onDismiss = jest.fn(() => {})
    const tree = renderer.create(<Instructions onDismiss={onDismiss} />)
    const button = tree.root.findByProps({ testID: 'dismiss_button' })

    button.props.onPress()
    expect(onDismiss).toHaveBeenCalled()
  })
})
