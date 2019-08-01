import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedAbout from '../About'

const About = withThemeProvider(ImportedAbout)

describe('About', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<About />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<About />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
