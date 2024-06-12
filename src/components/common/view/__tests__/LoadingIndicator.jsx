import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'

import { withStoresProvider } from '../../../../__tests__/__util__'
import { theme } from '../../../theme/styles'

import LoadingIndicator from '../LoadingIndicator'

const Element = withStoresProvider(LoadingIndicator)
describe('LoadingIndicator', () => {
  describe('when loading indicator is false', () => {
    it('should render empty without errors', () => {
      const component = renderer.create(
        <PaperProvider theme={theme}>
          <Element />
        </PaperProvider>,
      )

      const tree = component.toJSON()
      expect(tree).toBeTruthy()
    })

    it('should match snapshot', () => {
      const component = renderer.create(
        <PaperProvider theme={theme}>
          <Element />
        </PaperProvider>,
      )

      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('should match snapshot with default values', () => {
      const component = renderer.create(
        <PaperProvider theme={theme}>
          <Element force />
        </PaperProvider>,
      )

      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
