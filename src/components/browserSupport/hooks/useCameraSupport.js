import { iosSupportedWeb, isIOSWeb } from '../../../lib/utils/platform'
import useBrowserSupport from '../../browserSupport/hooks/useBrowserSupport'

// if non-ios camera support is present on all browsers
// for IOS camera is supported omnly in Safari or ios>=14.4 chrome+firefox
export default (options = {}) => {
  const defaultOnCheck = () => !isIOSWeb || iosSupportedWeb
  const { onCheck = defaultOnCheck, ...otherOptions } = options
  return useBrowserSupport({
    ...otherOptions,
    checkOutdated: false,
    onCheck,
  })
}
