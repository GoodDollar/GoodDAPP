import React from 'react'
import renderer from 'react-test-renderer'
import { PushButton as ImportedPushButton } from '../PushButton'
import { NextButton as ImportedNextButton } from '../stackNavigation'
import { withThemeProvider } from '../../../__tests__/__util__'
const PushButton = withThemeProvider(ImportedPushButton)
const NextButton = withThemeProvider(ImportedNextButton)

// Note: test renderer must be required after react-native.

describe('PushButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<PushButton>Push</PushButton>)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<PushButton>Push</PushButton>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('NextButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<NextButton />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<NextButton />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
