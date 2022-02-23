import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { forIn } from 'lodash'

import { NewReleaseDialog, RegularDialog } from '../ServiceWorkerUpdatedDialog'
import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'

describe('ServiceWorkerUpdatedDialog', () => {
  forIn({ RegularDialog, NewReleaseDialog }, (component, name) =>
    describe(name, () => {
      const WrappedComponent = withThemeAndLocalizationProvider(component)

      it(`renders without errors`, () => {
        let tree

        expect(() => (tree = renderer.create(<WrappedComponent />))).not.toThrow()
        expect(tree.toJSON()).toBeTruthy()
      })

      it(`matches snapshot`, () => {
        const tree = renderer.create(<WrappedComponent />)

        expect(tree.toJSON()).toMatchSnapshot()
      })
    }),
  )
})
