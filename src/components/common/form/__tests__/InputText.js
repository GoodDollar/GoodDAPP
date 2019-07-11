import React from 'react'
import renderer from 'react-test-renderer'
import InputText from '../InputText'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('InputText', () => {
  const WrappedInputText = withThemeProvider(InputText)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedInputText />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('empty matches snapshot', () => {
    const component = renderer.create(<WrappedInputText />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedInputText value="Text" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
