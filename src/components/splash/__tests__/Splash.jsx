import React from 'react'

// Note: react-test-renderer should be imported after react
import renderer from 'react-test-renderer'

import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedSplash from '../Splash'

const Splash = withThemeProvider(ImportedSplash)

describe('Splash', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<Splash />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
