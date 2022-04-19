// eslint-disable-next-line import/order
import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ViewOrUploadAvatar from '../ViewOrUploadAvatar'

jest.setTimeout(30000)

describe('ViewAvatar', () => {
  const WrappedViewOrUploadAvatar = withThemeProvider(ViewOrUploadAvatar)

  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedViewOrUploadAvatar />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
