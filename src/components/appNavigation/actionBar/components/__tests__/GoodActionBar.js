import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import importedGoodActionBar from '../GoodActionBar'
import { withThemeProvider } from '../../../../../__tests__/__util__/index'

jest.setTimeout(30000)

describe('GoodActionBar', () => {
  const GoodActionBar = withThemeProvider(importedGoodActionBar)
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<GoodActionBar />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
