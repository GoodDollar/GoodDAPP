import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import HelperWizard from '../FaceRecognition/HelperWizard'

describe('HelperWizard', () => {
  const WrappedHelperWizard = withThemeProvider(HelperWizard)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedHelperWizard skip={false} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedHelperWizard skip={false} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
