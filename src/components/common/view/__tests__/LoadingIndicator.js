import React from 'react'
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'

import SimpleStore from '../../../../lib/undux/SimpleStore'
import { theme } from '../../../theme/styles'

import LoadingIndicator from '../LoadingIndicator'

const { Container } = SimpleStore

describe('LoadingIndicator', () => {
  describe('when loading indicator is false', () => {
    it('should render empty without errors', () => {
      const component = renderer.create(
        <Container>
          <PaperProvider theme={theme}>
            <LoadingIndicator />
          </PaperProvider>
        </Container>
      )

      const tree = component.toJSON()
      expect(tree).toBeTruthy()
    })

    it('should match snapshot', () => {
      const component = renderer.create(
        <Container>
          <PaperProvider theme={theme}>
            <LoadingIndicator />
          </PaperProvider>
        </Container>
      )

      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('should match snapshot with default values', () => {
      const component = renderer.create(
        <Container>
          <PaperProvider theme={theme}>
            <LoadingIndicator force />
          </PaperProvider>
        </Container>
      )

      const tree = component.toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  // describe('when loading indicator is true', () => {
  //   beforeAll(() => {
  //     const setLoading = setLoadingWithStore(GDStore.useStore())
  //     setLoading(true)
  //   })

  //   it('should render without errors', () => {
  //     const component = renderer.create(
  //       <Container>
  //         <LoadingIndicator />
  //       </Container>
  //     )

  //     const tree = component.toJSON()
  //     expect(tree).toBeTruthy()
  //   })

  //   it('should match snapshot', () => {
  //     const component = renderer.create(
  //       <Container>
  //         <LoadingIndicator />
  //       </Container>
  //     )

  //     const tree = component.toJSON()
  //     expect(tree).toMatchSnapshot()
  //   })
  // })
})
