/**
 * Creating Animated component in a separate file because of errors with
 * Animated.createAnimatedComponent and Hot Module Replacement while reloading.
 */

import { SwipeableFlatList } from 'react-native-swipeable-lists'
import { Animated } from 'react-native'

export default Animated.createAnimatedComponent(SwipeableFlatList)
