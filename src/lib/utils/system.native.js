import { BackHandler } from 'react-native'
import RNRestart from 'react-native-restart'
import { noop } from 'lodash'

export const restart = () => RNRestart.Restart()

export const retryImport = fn => fn()

export const requestIdle = noop

export const exitApp = () => BackHandler.exitApp()
