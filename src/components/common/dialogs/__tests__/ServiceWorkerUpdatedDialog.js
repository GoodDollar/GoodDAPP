import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { forIn } from 'lodash'

import { NewReleaseDialog, RegularDialog } from '../ServiceWorkerUpdatedDialog'
import { withThemeProvider } from '../../../../__tests__/__util__'
import LanguageProvider from '../../../../language/i18n'

describe('ServiceWorkerUpdatedDialog', () => {
  forIn({ RegularDialog, NewReleaseDialog }, (component, name) =>
    describe(name, () => {
      const WrappedComponent = withThemeProvider(component)

      it(`renders without errors`, () => {
        let tree

        expect(
          () =>
            (tree = renderer.create(
              <LanguageProvider>
                <WrappedComponent />
              </LanguageProvider>,
            )),
        ).not.toThrow()
        expect(tree.toJSON()).toBeTruthy()
      })

      it(`matches snapshot`, () => {
        const tree = renderer.create(
          <LanguageProvider>
            <WrappedComponent />
          </LanguageProvider>,
        )

        expect(tree.toJSON()).toMatchSnapshot()
      })
    }),
  )
})
