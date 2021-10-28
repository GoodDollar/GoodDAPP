import { Platform } from 'react-native'
import { getSystemVersion } from 'react-native-device-info'

export default () => `${Platform.OS}: ${getSystemVersion()}`
