// @flow
import { createStackNavigator } from '../appNavigation/stackNavigation'
import BackupWallet from './BackupWallet'

export default createStackNavigator({ BackupWallet }, { backRouteName: 'Home' })
