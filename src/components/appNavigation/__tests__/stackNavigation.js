import React from 'react'
import renderer from 'react-test-renderer'
import { NextButton, PushButton } from '../stackNavigation'

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
