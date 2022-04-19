import React from 'react'
import renderer from 'react-test-renderer'
import BorderedBox from '../BorderedBox'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('BorderedBox', () => {
  const WrappedBorderedBox = withThemeProvider(BorderedBox)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedBorderedBox />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
