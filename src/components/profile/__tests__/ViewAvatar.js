import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ViewAvatar from '../ViewOrUploadAvatar'

describe('ViewAvatar', () => {
  const WrappedViewAvatar = withThemeProvider(ViewAvatar)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedViewAvatar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedViewAvatar />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
