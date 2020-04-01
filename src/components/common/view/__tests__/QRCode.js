import React from 'react'
import renderer from 'react-test-renderer'
import QRCode from '../QrCode/QRCode'
import { withThemeProvider } from '../../../../__tests__/__util__'

const QRCodeWithTheme = withThemeProvider(QRCode)

describe('QRCode', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<QRCodeWithTheme value={'code'} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<QRCodeWithTheme value={'code'} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<QRCodeWithTheme value={''} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
