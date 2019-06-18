// @flow
import BackupWallet from './BackupWallet'
import { createStackNavigator } from '../appNavigation/stackNavigation'

export default createStackNavigator({ BackupWallet }, { backRouteName: 'Home' })
