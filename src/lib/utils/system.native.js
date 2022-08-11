import { BackHandler } from 'react-native'
import RNRestart from 'react-native-restart'

export const restart = () => RNRestart.Restart()

export const retryImport = fn => fn()

export const exitApp = () => BackHandler.exitApp()

export const requireBrowser = module => {
  process.browser = true // this is required for some libs to import xhr correctly on RN

  const imports = require(module)

  process.browser = false
  return imports
}
