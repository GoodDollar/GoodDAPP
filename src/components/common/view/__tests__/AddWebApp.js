import React from 'react'
import renderer from 'react-test-renderer'
import ImportedAddWebApp from '../AddWebApp'
import { withSimpleStateProvider } from '../../../../__tests__/__util__/index'

// Note: test renderer must be required after react-native.
const AddWebApp = withSimpleStateProvider(ImportedAddWebApp)
describe('AddWebApp', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<AddWebApp />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
