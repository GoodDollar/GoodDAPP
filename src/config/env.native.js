import NativeConfig from 'react-native-config'
import { isFunction } from 'lodash'

const readEnv = () => {
  if (isFunction(NativeConfig.getConstants)) {
    return NativeConfig.getConstants()
  }

  return NativeConfig
}

export default readEnv()
