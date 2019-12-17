import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ViewOrUploadAvatar from '../ViewOrUploadAvatar'

describe('ViewAvatar', () => {
  const WrappedViewOrUploadAvatar = withThemeProvider(ViewOrUploadAvatar)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedViewOrUploadAvatar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedViewOrUploadAvatar />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
