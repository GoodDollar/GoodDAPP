import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import ExplanationDialog from '../ExplanationDialog'
import { withThemeProvider } from '../../../../__tests__/__util__'

describe('ExplanationDialog', () => {
  const WrappedWrapper = withThemeProvider(ExplanationDialog)

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedWrapper title="test" text="test" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
