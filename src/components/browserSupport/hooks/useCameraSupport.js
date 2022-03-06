import { iosSupportedWeb, isIOSWeb } from '../../../lib/utils/platform'
import useBrowserSupport from './useBrowserSupport'

// if non-ios camera support is present on all browsers
// for IOS camera is supported omnly in Safari or ios>=14.4 chrome+firefox
export default (options = {}) => {
  return useBrowserSupport({ ...options, checkOutdated: false, onCheck: () => !isIOSWeb || iosSupportedWeb })
}
