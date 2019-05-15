// @flow
import Mnemonics from './Mnemonics'
import BackupWallet from './BackupWallet'
import { createStackNavigator } from '../appNavigation/stackNavigation'

export default createStackNavigator({ Mnemonics, BackupWallet }, { backRouteName: 'Auth' })
