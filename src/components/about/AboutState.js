// @flow
import { createStackNavigator } from '../appNavigation/stackNavigation'
import About from './About'

export default createStackNavigator({ About }, { backRouteName: 'Home' })
