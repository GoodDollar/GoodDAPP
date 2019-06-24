import React from 'react'
import renderer from 'react-test-renderer'

import SimpleStore from '../../../lib/undux/SimpleStore'
import LoadingIndicator from '../LoadingIndicator'

// import LoadingIndicator, { setLoadingWithStore } from '../LoadingIndicator'

const { Container } = SimpleStore

describe('LoadingIndicator', () => {
  describe('when loading indicator is false', () => {
    // beforeAll(() => {
    //   const setLoading = setLoadingWithStore(GDStore.useStore())
    //   setLoading(false)
    // })

    it('should render empty without errors', () => {
      const component = renderer.create(
        <Container>
          <LoadingIndicator />
        </Container>
      )

      const tree = component.toJSON()
      expect(tree).toBeNull()
    })

    it('should match snapshot', () => {
      const component = renderer.create(
        <Container>
          <LoadingIndicator />
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
