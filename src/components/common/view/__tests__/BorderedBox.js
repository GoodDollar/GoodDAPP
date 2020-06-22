import React from 'react'
import renderer from 'react-test-renderer'
import BorderedBox from '../BorderedBox'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('BorderedBox', () => {
  const WrappedBorderedBox = withThemeProvider(BorderedBox)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedBorderedBox />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedBorderedBox />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
