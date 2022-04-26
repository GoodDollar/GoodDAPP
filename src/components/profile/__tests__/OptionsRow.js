import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import OptionsRow from '../OptionsRow'

describe('OptionsRow', () => {
  const WrappedOptionsRow = withThemeProvider(OptionsRow)

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedOptionsRow />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
