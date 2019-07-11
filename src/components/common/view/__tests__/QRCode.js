import React from 'react'
import renderer from 'react-test-renderer'
import QRCode from '../QRCode'

// Note: test renderer must be required after react-native.

describe('QRCode', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<QRCode value={'code'} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<QRCode value={'code'} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<QRCode value={''} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
