/**
 * @format
 */

import './shim.js'
import './native.js'
import Config from 'react-native-config'

console.disableYellowBox = !!Config.TEST_REACT_NATIVE;
