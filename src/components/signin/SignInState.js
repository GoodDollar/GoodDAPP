// @flow
import Mnemonics from './Mnemonics'
import { createStackNavigator } from '../appNavigation/stackNavigation'

export default createStackNavigator({ Mnemonics }, { backRouteName: 'Auth' })
