import React from 'react'
import renderer from 'react-test-renderer'
import ImportedSuccessIcon from '../SuccessIcon'
import { withThemeProvider } from '../../../../__tests__/__util__'
const SuccessIcon = withThemeProvider(ImportedSuccessIcon)

// Note: test renderer must be required after react-native.

describe('SuccessIcon', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<SuccessIcon />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
