import { Platform } from 'react-native'

// @flow
export const getShadowStyles = (web: String, native: Object = {}): Object => {
  return Platform.select({ web: { boxShadow: web }, default: native })
}
