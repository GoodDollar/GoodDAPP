import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { assign, isFunction } from 'lodash'
import { scriptLoaded } from '../utils/dom.web'
import { successState } from '../utils/async'

export default new class {
  Amplitude = amplitude.getInstance()

  Mautic = global.mt

  FS = global.FS

  GoogleAnalytics = global.dataLayer

  Sentry = SentryWeb

  mauticReady = successState(scriptLoaded('mtc.js'))

  /** @private */
  // eslint-disable-next-line require-await
  fullStoryReady = successState(async () => {
    const { _fs_ready, _fs_script } = window // eslint-disable-line camelcase

    // eslint-disable-next-line camelcase
    if (!_fs_script) {
      // will be caught by the successState
      throw new Error("FullStory snippet isn't installed")
    }

    const readyPromise = new Promise(resolve =>
      assign(window, {
        _fs_ready: () => {
          if (isFunction(_fs_ready)) {
            _fs_ready()
          }

          resolve()
        },
      }),
    )

    return Promise.race([
      // we would race with scriptLoaded's rejection only so we're returning an endless
      // promise on then() to guarantee that readyPromise could resolve the next one
      scriptLoaded(_fs_script).then(() => new Promise(() => {})),
      readyPromise,
    ])
  })
}()
