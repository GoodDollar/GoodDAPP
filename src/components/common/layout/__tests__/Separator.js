import React from 'react'
import renderer from 'react-test-renderer'
import ImportedSeparator from '../Separator'
import { withThemeProvider } from '../../../../__tests__/__util__'
const Separator = withThemeProvider(ImportedSeparator)

// Note: test renderer must be required after react-native.

describe('Separator', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Separator />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Separator />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(<Separator width={3} color="surface" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
