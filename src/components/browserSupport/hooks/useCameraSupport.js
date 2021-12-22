import { isIOSWeb, isSafari } from '../../../lib/utils/platform'
import useBrowserSupport from './useBrowserSupport'

// if non-ios camera support is present on all browsers
// for IOS camera is supported omnly in Safari
export default (options = {}) =>
  useBrowserSupport({ ...options, checkOutdated: false, onCheck: () => !isIOSWeb || isSafari })
