// @flow
import { createStackNavigator } from '../appNavigation/stackNavigation'
import Mnemonics from './Mnemonics'

export default createStackNavigator({ Mnemonics }, { backRouteName: 'Auth' })
