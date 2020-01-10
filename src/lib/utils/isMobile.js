import Platform from 'react-native'
import { isMobile } from 'mobile-device-detect'

export default () => {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return true
  }

  return isMobile
}
