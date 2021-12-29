import { noop } from 'lodash'
import { setUnhandledPromiseRejectionTracker } from 'react-native-promise-rejection-utils'

export const setUnhandledRejectionHanlder = callback =>
  setUnhandledPromiseRejectionTracker((_, reason) => callback(reason))

// in RN all uncaught exceptions ALWAYS will raise unhandled rejections
// so we don't need to add a separate uncaught exception handler like for the web
export const setUncaughExceptionHandler = noop
