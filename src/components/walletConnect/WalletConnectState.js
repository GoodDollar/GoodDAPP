// @flow
import { createStackNavigator } from '../appNavigation/stackNavigation'
import WalletConnect from './WalletConnect'

export default createStackNavigator({ WalletConnect }, { backRouteName: 'Home' })
