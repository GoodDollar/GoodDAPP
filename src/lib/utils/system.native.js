import { BackHandler } from 'react-native'
import RNRestart from 'react-native-restart'

export const restart = () => RNRestart.Restart()

export const retryImport = fn => fn()

export const exitApp = () => BackHandler.exitApp()
