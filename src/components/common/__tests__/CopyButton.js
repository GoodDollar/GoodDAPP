import React from 'react'
import renderer from 'react-test-renderer'
import CopyButton from '../CopyButton'

// Note: test renderer must be required after react-native.

describe('CopyButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<CopyButton toCopy={'stringToCopy'} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<CopyButton toCopy={'stringToCopy'} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <CopyButton toCopy={'stringToCopy'} mode="outlined">
        Title in CopyButton
      </CopyButton>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
