import React from 'react'
import renderer from 'react-test-renderer'
import ImportedSeparator from '../Separator'
import { withThemeProvider } from '../../../../__tests__/__util__'
const Separator = withThemeProvider(ImportedSeparator)

// Note: test renderer must be required after react-native.

describe('Separator', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<Separator />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<Separator width={3} color="surface" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
