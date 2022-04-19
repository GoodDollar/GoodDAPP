import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeAndLocalizationProvider } from '../../../__tests__/__util__'
import ImportedAbout from '../About'

const About = withThemeAndLocalizationProvider(ImportedAbout)

describe('About', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<About />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
