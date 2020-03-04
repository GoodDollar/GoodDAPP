import { isMobileNative, isMobileWeb } from './platform'

export default () => isMobileNative || (isMobileWeb && navigator.share)
