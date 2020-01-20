import { Platform } from 'react-native'

export default () => {
  return Platform.OS === 'android' || Platform.OS === 'ios'
}
