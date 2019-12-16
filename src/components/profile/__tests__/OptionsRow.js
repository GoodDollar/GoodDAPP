import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import OptionsRow from '../OptionsRow'

describe('ViewAvatar', () => {
  const WrappedOptionsRow = withThemeProvider(OptionsRow)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedOptionsRow />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedOptionsRow />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
