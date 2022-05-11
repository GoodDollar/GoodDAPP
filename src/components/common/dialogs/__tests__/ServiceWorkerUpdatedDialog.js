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

      it(`matches snapshot`, async () => {
        let tree

        // eslint-disable-next-line require-await
        await renderer.act(async () => (tree = renderer.create(<WrappedComponent />)))

        expect(tree.toJSON()).toMatchSnapshot()
      })
    }),
  )
})
